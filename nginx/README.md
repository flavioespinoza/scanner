# Nginx
Reverse proxy setup with SSL

## Very Important
All of Exemplar's routes can be accessed with `http` - this is for 2 reasons:
1. our current config does not listen on port `80` for `http` request
2. we are not adding the `dhparam` parameter in our config

## Diffie Hellman Parameter | dhparam
In order to enable [Perfect Forward Secrecy](https://blog.ivanristic.com/2013/06/ssl-labs-deploying-forward-secrecy.html), we need to create a `Diffie Hellman Parameter` or `dhparam`. this is done using `openssl`:

Let's Encrypt and Nginx uses this command:

```bash
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
```
It points the SSL domain port 443 to 8080 and add an additional .pem key and allows [Perfect Forward Secrecy](https://blog.ivanristic.com/2013/06/ssl-labs-deploying-forward-secrecy.html) between them

Output: 
![dhparam output](https://miro.medium.com/max/1116/1*JcEZ4FNutITP5wUwU23YZQ.png)

### YouTube: 
[Secret Key Exchange (Diffie-Hellman) - Computerphile](https://www.youtube.com/watch?v=NmM9HA2MQGI)

### Github: 
[Nginx with OpenSSL -- Diffie–Hellman (DH) key exchange with at least 2048 bits](https://gist.github.com/yidas/3701601c86dfaac6bb16016a3786be9a)

### Config
You then need to add this to your config file below the letsencrypt keys:

```shell
    listen                          443 ssl;

    ssl                             on;
    server_name                     example.com www.example.com;

    ssl_certificate                 /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key             /etc/letsencrypt/live/example.com/privkey.pem;
    include                         /etc/letsencrypt/options-ssl-nginx.conf;

    ssl_dhparam                     /etc/ssl/certs/dhparam.pem;  
```

# Why this matters using OpenSSL
- [Diffie Hellman key exchange -- Practical_attacks_on_Internet_traffic](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange#Practical_attacks_on_Internet_traffic)
- Diffie Hellman Secret Key Exchange using OpenSSL: [link](https://sandilands.info/sgordon/diffie-hellman-secret-key-exchange-with-openssl)
- Wikipedia: [link](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)
- Stack Exchange: [link](https://security.stackexchange.com/questions/94390/whats-the-purpose-of-dh-parameters)

# Proper Config

default.conf
```js
upstream nginx_rev_proxy {
    server  localhost:8080;
}

upstream api_proxy {
    server  localhost:5000;
}

server {

    listen 80;
    listen [::]:80; 
    server_name example.com www.example.com;  

    return 302 https://$server_name$request_uri;

}

server {
    listen                          443 ssl;

    ssl                             on;
    server_name                     example.com www.example.com;

    ssl_certificate                 /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key             /etc/letsencrypt/live/example.com/privkey.pem;
    include                         /etc/letsencrypt/options-ssl-nginx.conf;

    ssl_dhparam                     /etc/letsencrypt/ssl-dhparams.pem;

    keepalive_timeout               60;
    ssl_session_cache               shared:SSL:10m;

    large_client_header_buffers     8 32k;

    location / {
        
        proxy_pass                  http://nginx_rev_proxy;
        proxy_next_upstream         error timeout invalid_header http_500 http_502 http_504;
        proxy_redirect              off;
        proxy_buffering             off;

        proxy_set_header            Host                    $host;
        proxy_set_header            X-Real-IP               $remote_addr;
        proxy_set_header            X-Forwarded-For         $proxy_add_x_forwarded_for;
        proxy_set_header            X-Forwarded-Proto       $https;
        add_header                  Front-End-Https         on;

    }

    error_page 404  /404.html;
    location = /404.html {
        root   /usr/share/nginx/html;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    location /api/ {

        proxy_pass                  http://api_proxy;
        proxy_redirect              off;

        proxy_http_version          1.1;

        proxy_set_header            Upgrade                 $http_upgrade;
        proxy_set_header            Connection              "upgrade";

        proxy_set_header            Host                    $host;
        proxy_set_header            X-Real-IP               $remote_addr;
        proxy_set_header            X-Forwarded-For         $proxy_add_x_forwarded_for;

    }

}
```



## Best Tutorial
> This one has all the info to make your life easier! :)
- Tutorial: [link]()
- YouTube: [link]()
- GitHub: [link]()

## Other Tutorials
> Resources used to create the Best Tutorial
#### Digital Ocean
- Tutorial: [link]()


#### AWS EC2 with SSL & Nginx
- Tutorial: [link](https://medium.com/@Keithweaver_/setting-up-mern-stack-on-aws-ec2-6dc599be4737)

- YouTube: [link](https://youtu.be/GKIIL743Gjo?t=93)
