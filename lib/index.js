const Promise = require("bluebird");
const { URL } = require("url");
const unique = require("just-unique");
const flatten = require("just-flatten-it");
const config = require("./config");
const nslookup = require("./nslookup");
const fetch = require("./speed/fetch");
const ping = require("./speed/ping");
const { checkIsDomainURI } = require("./utils");

const noop = () => {};
const noopProgress = noop;
noopProgress.success = noop;
noopProgress.warn = noop;

exports.run = async ({
  uri,
  pingTimeout,
  fetchTimeout,
  progress = noop,
  verbose = noop,
}) => {
  let isDomainURI = checkIsDomainURI(uri);
  let domain = isDomainURI ? uri : new URL(uri).hostname;

  let servers = config.get("servers");

  let groups = [];
  progress("NSLookup (via DNS)", servers.dns.length);
  groups = groups.concat(
    await Promise.map(servers.dns, (server) => {
      return nslookup(domain, server)
        .tap(() => progress.success("NSLookup (via DNS)"))
        .then(
          (ips) => ({ protocol: "dns", server, domain, ips }),
          (error) => {
            progress.warn("NSLookup (via DNS)", error.message);
            return {
              protocol: "dns",
              server,
              domain,
              ips: [],
            };
          }
        );
    })
  );
  progress("NSLookup (via DoH)", servers.doh.length);
  groups = groups.concat(
    await Promise.map(servers.doh, (server) => {
      return nslookup(domain, server, "DOH")
        .tap(() => progress.success("NSLookup (via DoH)"))
        .then(
          (ips) => ({
            protocol: "doh",
            server,
            domain,
            ips,
          }),
          (error) => {
            progress.warn("NSLookup (via DoH)", error.message);
            return {
              protocol: "doh",
              server,
              domain,
              ips: [],
            };
          }
        );
    })
  );
  verbose(`nslookup result: ${JSON.stringify(groups, null, 2)}`);

  let ips = unique(flatten(groups.map(({ ips }) => ips)));
  verbose(`ips after removal of repetition: ${JSON.stringify(ips, null, 2)}`);

  let providers = {};

  ips.forEach((ip) => {
    providers[ip] = groups
      .filter(({ ips }) => ~ips.indexOf(ip))
      .map(({ protocol, server }) =>
        protocol === "doh" ? `${server} (DoH)` : server
      );
  });

  if (isDomainURI) {
    progress("Ping", ips.length);
    let times = await Promise.map(ips, (ip) => {
      return ping(ip, pingTimeout)
        .tap(() => progress.success("Ping"))
        .then(
          (duration) => ({ ip, duration, providers: providers[ip] }),
          (error) => {
            progress.warn("Ping", error.message);
            return {
              ip,
              duration: Infinity,
              providers: providers[ip],
            };
          }
        );
    });
    verbose(`times: ${JSON.stringify(times, null, 2)}`);
    let sorted = times.sort((left, right) => left.duration - right.duration);
    return { times: sorted, isDomainURI };
  } else {
    progress("Fetch", ips.length);
    let times = await Promise.map(ips, (ip) => {
      return fetch(uri, ip, fetchTimeout)
        .tap(() => progress.success("Fetch"))
        .then(
          (duration) => ({ ip, duration, providers: providers[ip] }),
          (error) => {
            progress.warn("Fetch", error.message);
            return {
              ip,
              duration: Infinity,
              providers: providers[ip],
            };
          }
        );
    });
    verbose(`times: ${JSON.stringify(times, null, 2)}`);
    let sorted = times.sort((left, right) => left.duration - right.duration);
    return { times: sorted, isDomainURI };
  }
};
