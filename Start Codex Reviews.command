#!/bin/zsh
cd -- "${0:A:h}"
connector_node="$(command -v node)"
if [[ -z "$connector_node" && -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]]; then
 connector_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
if [[ -z "$connector_node" ]]; then
 echo 'Node.js 22 or newer is required. Install it, then open this launcher again.'
 read -k 1
 exit 1
fi
"$connector_node" connector/start.mjs
if [[ $? -ne 0 ]]; then
 echo 'Connector stopped. See the message above.'
 read -k 1
fi
