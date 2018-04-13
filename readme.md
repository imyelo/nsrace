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

### Output as JSON
```bash
nsrace run github.com -o json
# [{"ip":"52.74.223.119","ping":236.8055058,"providers":["117.50.11.11","223.5.5.5","119.29.29.29","180.76.76.76","101.226.4.6","123.125.81.6","101.226.4.6","101.226.4.6","1.2.4.8","8.8.8.8","1.1.1.1","208.67.222.222"]}]
```

### Play with [json](https://npm.im/json)
```bash
# first, install the ``json`` package to the global
npm i -g json

nsrace run github.com --silent -o json | json 0.ip
# 52.74.223.119
```

Run ``nsrace`` or ``nsrace --help`` for more information.

## Commands
### run [domain]
Run a race and return IPs sorted by speed

#### Options
- ``-o, --output [format]``

  Specify the format of the output ``[table|tsv|json]``

  Default: ``table``

- ``--ping-timeout [ms]``

  Ping timeout

  Default: 1000

- ``-s, --silent``

  Hide the progress

- ``-v, --verbose``

  Display verbose information


### list
List all DNS servers that will be used in the race

#### Options
- ``-o, --output [format]``

  Specify the format of the output ``[table|tsv|json]``

  Default: ``table``


### add [dns]
Add DNS servers

### remove [dns]
Remove DNS servers


## Related
- [native-dns](https://npm.im/native-dns)
- [tcp-ping](https://npm.im/tcp-ping)


## Reference
- [TSV](https://docs.microsoft.com/en-us/cli/azure/format-output-azure-cli?view=azure-cli-latest#tsv-output-format)


## License
MIT @ [yelo](https://github.com/imyelo)
