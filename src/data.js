export const TYPES = [
  { n: 'DDoS flood', m: 'T1498', t: 'Network Denial of Service', k: 'Impact', a: 'Rate-limit the source range at the edge and enable SYN protection on the target.', w: 'n' },
  { n: 'Port scan', m: 'T1046', t: 'Network Service Discovery', k: 'Discovery', a: 'Block the scanning host and review which exposed services responded.', w: 'n' },
  { n: 'Brute force', m: 'T1110', t: 'Brute Force', k: 'Credential Access', a: 'Lock the targeted account, enforce MFA and block the source IP.', w: 'n' },
  { n: 'Malware C2 beacon', m: 'T1071', t: 'Application Layer Protocol', k: 'Command and Control', a: 'Isolate the internal host and add the destination to the MISP blocklist.', w: 'm' },
  { n: 'Data exfiltration', m: 'T1041', t: 'Exfiltration Over C2 Channel', k: 'Exfiltration', a: 'Cut the outbound session and start forensic capture on the host.', w: 'm' }
];
