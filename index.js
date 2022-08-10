import ping from 'ping';
import fetch from 'node-fetch';
import logUpdate from 'log-update';
import color from 'colors';
const url = 'https://steamcdn-a.akamaihd.net/apps/sdr/network_config.json';

(async function () {
  logUpdate(color.yellow('Fetching Servers'));
  const servers = await fetchServers();
  logUpdate(color.green(`Fetched ${servers.length} Servers`));
  logUpdate.done();
  for (const server of servers) {
    logUpdate(color.green('Pinging'), color.bgWhite(server.name));
    let ping = await pingServer(server.relays[ 0 ]);
    if (ping === 'unknown') { logUpdate(color.red(`${server.name} did not respond`)) }
    else { logUpdate(color.bold(`${server.name}`), color.italic(`${ping}ms`)); }
    logUpdate.done();
  }
})();

async function pingServer(ip) {
  return (await ping.promise.probe(ip)).time;
}

async function fetchServers() {
  const { pops } = await fetch(url).then(res => res.json());
  const servers = [];
  Object.keys(pops).forEach(a => {
    const pop = pops[ a ];
    if (!pop.relays || !pop.relays.length)
      return;
    servers.push({
      name: pop.desc,
      relays: pop.relays.map(b => b.ipv4)
    });
  });
  return servers;
}
