# nsrace

> :runner: Runs a race, lookups the fastest IP of any domain from different DNS servers

## Installation

```bash
npm i -g nsrace
```

## Usage

### Basic

```bash
nsrace run github.com
# √ NSLookup 12/12
# √ Ping 1/1
# ┌────────────────┬─────────────────────┬─────────────────┐
# │ IP             │ Ping (ms)           │ Providers       │
# ├────────────────┼─────────────────────┼─────────────────┤
# │ 13.229.188.59  │ 252.43719290000004  │ 117.50.11.11... │
# └────────────────┴─────────────────────┴─────────────────┘
```

```bash
nsrace run https://github.githubassets.com/favicons/favicon.svg
# √ NSLookup 12/12
# √ Fetch 1/1
# ┌─────────────────┬─────────────────────┬─────────────────┐
# │ IP              │ Duration (ms)           │ Providers       │
# ├─────────────────┼─────────────────────┼─────────────────┤
# │ 185.199.110.154 │ 189.43719290000004  │ 117.50.11.11... │
# └─────────────────┴─────────────────────┴─────────────────┘
```

### Output as JSON

```bash
nsrace run github.com -o json
# [{"ip":"20.205.243.166","duration":62.237456499999986,"providers":[{"protocol":"DNS","server":"117.50.11.11"},{"protocol":"DNS","server":"223.5.5.5"},{"protocol":"DNS","server":"119.29.29.29"},{"protocol":"DNS","server":"180.76.76.76"},{"protocol":"DNS","server":"101.226.4.6"},{"protocol":"DNS","server":"123.125.81.6"},{"protocol":"DNS","server":"101.226.4.6"},{"protocol":"DNS","server":"101.226.4.6"},{"protocol":"DNS","server":"101.6.6.6"},{"protocol":"DNS","server":"1.2.4.8"},{"protocol":"DNS","server":"8.8.8.8"},{"protocol":"DNS","server":"1.1.1.1"},{"protocol":"DNS","server":"4.2.2.1"},{"protocol":"DNS","server":"9.9.9.9"},{"protocol":"DNS","server":"208.67.222.222"},{"protocol":"DoH","server":"1.1.1.1"},{"protocol":"DoH","server":"8.8.8.8"},{"protocol":"DoH","server":"9.9.9.9"},{"protocol":"DoH","server":"208.67.222.222"}]}]
```

### Play with [json](https://npm.im/json)

```bash
# first, install the ``json`` package to the global
npm i -g json

nsrace run github.com --silent -o json | json 0.ip
# 20.205.243.166
```

Run `nsrace` or `nsrace --help` for more information.

## Commands

### run [domain|url]

Run a race and return IPs sorted by speed

#### Options

- `-o, --output [format]`

  Specify the format of the output `[table|tsv|json]`

  Default: `table`

- `--ping-timeout [ms]`

  Ping timeout (speed test)

  Default: 1000

- `--fetch-timeout [ms]`

  Fetch timeout (speed test)

  Default: 1000

- `-s, --silent`

  Hide the progress

- `-v, --verbose`

  Display verbose information

### list

List all DNS servers that will be used in the race

#### Options

- `-o, --output [format]`

  Specify the format of the output `[table|tsv|json]`

  Default: `table`

### add [dns]

Add DNS servers

#### Options

- `-t, --type [protocol]`

  Specify the type of protocol `[dns|doh]`

  Default: `dns`

### remove [dns]

Remove DNS servers

#### Options

- `-t, --type [protocol]`

  Specify the type of protocol `[dns|doh]`

  Default: `dns`

## Related

- [native-dns](https://npm.im/native-dns)
- [tcp-ping](https://npm.im/tcp-ping)

## Reference

- [TSV](https://docs.microsoft.com/en-us/cli/azure/format-output-azure-cli?view=azure-cli-latest#tsv-output-format)

## License

MIT @ [yelo](https://github.com/imyelo)
