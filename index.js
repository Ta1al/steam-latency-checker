import ping from 'ping';
import fetch from 'node-fetch';
import logUpdate from 'log-update';
import 'colors';
const url = 'https://steamcdn-a.akamaihd.net/apps/sdr/network_config.json';

(async function () {
  logUpdate('Fetching Servers'.yellow);
  const servers = await fetchServers();
  logUpdate(`Fetched ${servers.length} Servers`.green);
  logUpdate.done();
  for (const server of servers) {
    logUpdate('Pinging'.green, `${server.name}`.bgWhite);
    let ping = await pingServer(server.relays[ 0 ]);
    if (ping === 'unknown') { logUpdate(`${server.name} did not respond`.red) }
    else { logUpdate(`${server.name}`.bold, `${ping}ms`.italic); }
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
