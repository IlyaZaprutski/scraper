import request from 'request-promise';
import Url from 'url-parse';
import TorHttpAgent from 'socks5-http-client/lib/Agent';
import TorHttpsAgent from 'socks5-https-client/lib/Agent';
import ua from 'random-ua';

export const scrape = opt => {
  const options = opt || {};
  const url = options.url || options.uri;
  const parsedUrl = new Url(url);
  const Agent = parsedUrl.protocol === 'https:' ? TorHttpsAgent : TorHttpAgent;

  options.headers = { ...options.headers, 'User-Agent': ua.generate() };

  options.rejectUnauthorized = false;
  options.requestCert = false;
  options.strictSSL = false;
  options.followAllRedirects = true;

  options.agentClass = Agent;
  options.agentOptions = {
    socksHost: 'localhost',
    socksPort: options.socksPort || 9050,
  };

  return request(options);
};

export const fetch = options => downloadWithRequest(options);
