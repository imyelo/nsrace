const Conf = require('conf')

const DEFAULT_CONFIG = {
  // Check https://public-dns.info/ for more servers.
  // And https://public-dns.info/nameserver/cn.html too.
  servers: [
    '117.50.11.11', // OneDNS
    '223.5.5.5', // Ali Public DNS
    '119.29.29.29', // DNSPod Public DNS+
    '180.76.76.76', // Baidu Public DNS
    '101.226.4.6', // DNSPai (360) - 电信
    '123.125.81.6', // DNSPai (360) - 联通
    '101.226.4.6', // DNSPai (360) - 移动
    '101.226.4.6',  // DNSPai (360) - 铁通
    '1.2.4.8', // CNNIC sDNS
    '8.8.8.8', // Google Public DNS
    '1.1.1.1', // Cloudflare DNS
    '208.67.222.222', // OpenDNS
  ],
}

module.exports = new Conf({ defaults: DEFAULT_CONFIG })
