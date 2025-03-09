# Nginx笔记

## 1.Nginx介绍

Nginx 是开源、高性能、高可靠的 Web 和反向代理服务器，而且支持热部署，几乎可以做到 7 * 24 小时不间断运行，即使运行几个月也不需要重新启动，还能在不间断服务的情况下对软件版本进行热更新。性能是 Nginx 最重要的考量，其占用内存少、并发能力强、能支持高达 5w 个并发连接数，最重要的是，Nginx 是免费的并可以商业化，配置使用也比较简单。

### 1.1 Nginx 的最重要的几个使用场景

1. 提供静态资源服务，通过本地文件系统提供服务；
2. 用作反向代理，延伸出包括缓存、负载均衡等；
3. API 服务 ；

对于前端来说 Node.js 不陌生了，Nginx 和 Node.js 的很多理念类似，HTTP 服务器、事件驱动、异步非阻塞等，且 Nginx 的大部分功能使用 Node.js 也可以实现，但 Nginx 和 Node.js 并不冲突，都有自己擅长的领域。Nginx 擅长于底层服务器端资源的处理（静态资源处理转发、反向代理，负载均衡等），Node.js 更擅长上层具体业务逻辑的处理，两者可以完美组合，共同助力前端开发。

## 2. 相关概念

### 2.1 简单请求和非简单请求

**简单请求**

不会触发CORS预检的请求称为简单请求，满足以下所有条件的才会被视为简单请求，基本上我们日常开发只会关注前面两点

1. 使用GET、POST、HEAD其中一种方法

2. 只使用了如下的安全首部字段，不得人为设置其他首部字段

   - Accept

   - Accept-Language

   - Content-Language

   - Content-Type

     仅限以下三种

     - text/plain
     - multipart/form-data
     - application/x-www-form-urlencoded

   - HTML头部header field字段：DPR、Download、Save-Data、Viewport-Width、WIdth

3. 请求中的任意XMLHttpRequestUpload 对象均没有注册任何事件监听器；XMLHttpRequestUpload 对象可以使用 XMLHttpRequest.upload 属性访问

4. 请求中没有使用 ReadableStream 对象

**非简单请求（预检请求）**

“需预检的请求”要求必须首先使用 OPTIONS 方法发起一个预检请求到服务器，以获知服务器是否允许该实际请求。"预检请求“的使用，可以避免跨域请求对服务器的用户数据产生未预期的影响。

1. 使用了PUT、DELETE、CONNECT、OPTIONS、TRACE、PATCH方法
2. 人为设置了非规定内的其他首部字段，参考上面简单请求的安全字段集合，还要特别注意Content-Type的类型
3. XMLHttpRequestUpload 对象注册了任何事件监听器
4. 请求中使用了ReadableStream对象

![img](https://raw.githubusercontent.com/hankanon/picture/main/img/post.png){data-zoomable}

| **CORS**预检请求触发条件                                     | 本次请求是否触发该条件 |
| ------------------------------------------------------------ | ---------------------- |
| 1. 使用了下面任一HTTP 方法：                                 |                        |
| PUT/DELETE/CONNECT/OPTIONS/TRACE/PATCH                       | 否，本次为post请求     |
| 2. 人为设置了以下集合之外首部字段：                          |                        |
| Accept/Accept-Language/Content-Language/Content-Type/DPR/Downlink/Save-Data/Viewport-Width/Width | 否，未设置其他头部字段 |
| 3. Content-Type 的值不属于下列之一:                          |                        |
| application/x-www-form-urlencoded、multipart/form-data、text/plain | 是，为application/json |

## 2.2 跨域

在浏览器上当前访问的网站向另一个网站发送请求获取数据的过程就是跨域请求。

举个例子：🌰

```bash
# 同源的例子
http://example.com/app1/index.html  # 只是路径不同
http://example.com/app2/index.html

http://Example.com:80  # 只是大小写差异
http://example.com

# 不同源的例子
http://example.com/app1   # 协议不同
https://example.com/app2

http://example.com        # 域名 不同
http://www.example.com
http://myapp.example.com

http://example.com        # 端口不同
http://example.com:8080

```

## 2.3 反向代理

反向代理的一个常见例子是Web服务器的负载均衡器，它将HTTP请求分发到多个Web服务器上，同时还可以提供SSL加密、压缩和缓存等功能。

## 2.4 负载均衡

Nginx 可以将请求分发到多个后端服务器上，实现负载均衡。这有助于提高应用的可用性和可靠性，防止单个服务器因负载过高而崩溃。

## 2.5 动静分离

为了加快网站的解析速度，可以把动态页面和静态页面由不同的服务器来解析，加快解析速度，降低原来单个服务器的压力。

```nginx
http {
    upstream static {
        server static1.example.com;
        server static2.example.com;
    }
  
    upstream backend {
        server backend1.example.com;
        server backend2.example.com;
    }

    server {
        listen 80;

        # 静态资源代理配置
        location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
            expires 30d; # 静态资源的过期时间为 30 天
            access_log off; #关闭了对该位置的访问日志记录，以减少磁盘 I/O 和日志文件大小
            proxy_pass http://static;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # 其他请求可以转发到其他服务器或进行其他处理
        location / {
            # 这里可以是另一个 upstream 或直接指向一个具体服务器
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

## 3. Nginx 配置语法

### 3.1 nginx.conf 结构图

```
main        # 全局配置，对全局生效
├── events  # 配置影响 Nginx 服务器或与用户的网络连接
├── http    # 配置代理，缓存，日志定义等绝大多数功能和第三方模块的配置
│   ├── upstream # 配置后端服务器具体地址，负载均衡配置不可或缺的部分
│   ├── server   # 配置虚拟主机的相关参数，一个 http 块中可以有多个 server 块
│   ├── server
│   │   ├── location  # server 块可以包含多个 location 块，location 指令用于匹配 uri
│   │   ├── location
│   │   └── ...
│   └── ...
└── ...

```

### 3.2 Nginx的配置语法

1. **基本指令结构**：

   - 指令总是以指令名称开始，后跟一个或多个参数，参数与指令名称之间用空格分隔。
   - 指令块以大括号 `{}` 包裹，表示该指令的配置项。

2. **配置文件的层级结构**：

   - Nginx 的配置文件由一系列的指令块组成，其中包括 `http`、`server`、`location` 等。
   - `http` 块是最顶层的指令块，通常包含 `server` 块。
   - `server` 块可以视为一个虚拟服务器，通常包含 `location` 块。
   - `location` 块定义了请求的处理方式。

3. **指令和参数**：

   - 指令后面跟着的是参数，例如：

     ```
     listen 80;
     ```

   - 参数可以是字符串、数字或其他指令。

4. **注释**：

   - 使用 `#` 符号添加注释，直到行尾的所有内容都会被忽略。

5. **配置指令的示例**：

   ```nginx
   user  nginx;                        # 运行用户，默认即是nginx，可以不进行设置
   worker_processes  1;                # Nginx 进程数，一般设置为和 CPU 核数一样
   error_log  /var/log/nginx/error.log warn;   # Nginx 的错误日志存放目录
   pid        /var/run/nginx.pid;      # Nginx 服务启动时的 pid 存放位置
   
   events {
       use epoll;     # 使用epoll的I/O模型(如果你不知道Nginx该使用哪种轮询方法，会自动选择一个最适合你操作系统的)
       worker_connections 1024;   # 每个进程允许最大并发数
   }
   
   # 定义一个 http 块
   http {   # 配置使用最频繁的部分，代理、缓存、日志定义等绝大多数功能和第三方模块的配置都在这里设置
       # 设置日志格式
       log_format main '$http_x_forwarded_for - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
   
       access_log  /var/log/nginx/access.log  main;   # Nginx访问日志存放位置
   
       sendfile            on;   # 开启高效传输模式
       tcp_nopush          on;   # 减少网络报文段的数量
       tcp_nodelay         on;
       keepalive_timeout   65;   # 保持连接的时间，也叫超时时间，单位秒
       types_hash_max_size 2048;
   
       include             /etc/nginx/mime.types;      # 文件扩展名与类型映射表
       default_type        application/octet-stream;   # 默认文件类型
   
       # include /etc/nginx/conf/*.conf;   # 加载子配置项
       
       # 定义一个 server 块
       server {
           # 设置监听的 IP 和端口
           listen 80;
   
           # 设置 server 名称
           server_name example.com www.example.com;
   
           # 定义一个 location 块
           location / {
               # 设置 root 指令，指向静态文件的目录
               root /usr/share/nginx/html;
               # 设置默认页面
               index index.html index.htm;
          			deny 172.168.22.11;   # 禁止访问的ip地址，可以为all
               allow 172.168.33.44； # 允许访问的ip地址，可以为all
           }
   
           # 定义另一个 location 块
           location /images/ {
               # 配置静态资源的缓存
               expires 30d;
           }
           error_page 500 502 503 504 /50x.html;  # 默认50x对应的访问页面
           error_page 400 404 error.html;   # 同上
       }
   }
   
   ```

6. **使用变量**：

   Nginx 支持使用变量来动态生成配置，例如：

   ```
   log_format main '$http_x_forwarded_for - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';
   ```

7. **包含其他配置文件**：

   使用 include 指令来包含其他配置文件，这允许将配置分散在多个文件中：

   ```
   include /etc/nginx/conf.d/*.conf;
   ```

8. **条件语句**：

   Nginx 允许使用 if 语句来根据条件执行不同的配置：

   ```
   if ($http_host ~* ^www) {
       return 301 $scheme://$host$request_uri;
   }
   ```

### 3.3 location 指令的用法

```nginx
location [ = | ~ | ~* | ^~] uri {
	...
}
```



1. **基本用法**：
   - `location /`：匹配所有请求，因为所有 URI 都以 `/` 开头。
2. **精确匹配**：
   - `location = /`：精确匹配请求 URI 为 `/`。
3. **普通字符串匹配**：
   - `location /images/`：匹配所有以 `/images/` 开头的请求。
4. **非正则表达式匹配**：
   - `location ^~ /images/`：匹配所有以 `/images/` 开头的请求，并且 Nginx 在这次匹配之后不会再搜索正则表达式的 `location` 块。
5. **正则表达式匹配**：
   - `location ~ \.php$`：匹配所有以 `.php` 结尾的请求。
   - `location ~* \.(jpg|jpeg|png)$`：不区分大小写地匹配所有以 `.jpg`、`.jpeg` 或 `.png` 结尾的请求。

## 4. Nginx 的一些常用配置

### 4.1 反向代理配置

```nginx
http {
    upstream api_backend {
        server www.api.server.com;
    }

    server {
        listen 80;

        # 代理所有 /api 开头的请求到 api_backend 上游服务器
        location ~ ^/api/ {
            proxy_pass http://api_backend;

            # 设置客户端的请求头信息
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 4.2 nginx CORS 跨域配置

```nginx
server {
    listen 80;
    server_name your.domain.com;

    location / {
        # 代理到后端服务
        proxy_pass http://backend.server:port/;

        # 以下是 CORS 相关的配置， 也可以设置到server里
        add_header 'Access-Control-Allow-Origin' $http_origin; # 可以根据实际情况限制来源，带cookie的请求不支持*
        add_header 'Access-Control-Allow-Credentials' 'true'; # 为 true 可带上 cookie
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';  # 允许请求方法
        add_header 'Access-Control-Allow-Headers' 'X-Requested-With,Content-Type,Accept,Origin,Authorization'; # 设置允许的请求头

        # 处理预检请求
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Max-Age' 1728000; # 设置预检请求的有效期（单位为秒）
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
}
```

### 4.3 开启 gzip 压缩

```nginx
server {
    # ... 其他配置 ...

    # 开启 gzip 压缩
    gzip on;
    gzip_vary on; # 根据请求头中的 Accept-Encoding 启用压缩
    gzip_proxied expired no-cache no-store private auth; # any 无论请求是否已经压缩，都进行压缩
    gzip_http_version 1.0; # 默认 1.1，启用 gzip 所需的 HTTP 最低版本
    gzip_min_length 1k; # 设置压缩的最小长度
    gzip_comp_level 5; # 设置压缩级别
    gzip_types text/plain application/javascript text/css application/xml application/json image/jpeg image/png;

    # 启用静态压缩
    location ~* \.(html|css|js|json)$ {
        gzip_static on; # 为了使用 gzip_static，你需要确保在构建过程中已经生成了 .gz 压缩文件，并且 Nginx 能够访问到这些文件。
        # 确保 MIME 类型正确
        types {
            text/html               html;
            text/css                css;
            application/javascript  js;
            application/json        json;
        }
    }

    # ... 其他配置 ...
}
```

1. **启用 gzip 压缩**： 在 `http` 块中启用 gzip 压缩，并设置压缩级别。压缩级别可以从 `1` 到 `9`，其中 `1` 最快但压缩比最低，`9` 最慢但压缩比最高。通常推荐使用默认值 `5`。
2. **设置 gzip 压缩的类型**： 使用 `gzip_types` 指令来指定哪些 MIME 类型将被压缩。你可以根据需要调整这些类型。
3. **排除小文件压缩**： 为了避免对小文件进行压缩，因为小文件压缩后的大小可能不会减少多少，反而增加了 CPU 负载，你可以设置 `gzip_min_length`。
4. **配置缓存**： 使用 `gzip_comp_level` 和 `gzip_proxied` 指令来优化压缩性能。
5. **启用压缩的 HTTP 头部**： 使用 `gzip_vary` 来启用 Vary HTTP 响应头，这有助于告知浏览器和代理服务器，根据不同的 `Accept-Encoding` 头部，响应可能有不同的压缩版本。

### 4.4 负载句均衡配置

Nginx 支持多种负载均衡策略，可以根据不同的应用场景选择最合适的策略。以下是 Nginx 支持的一些常见负载均衡策略及其配置方法：

1. **轮询（Round Robin）**： 这是默认的负载均衡策略，Nginx 会按顺序将请求轮流分配给后端服务器。

   ```
   upstream myapp {
       server backend1.example.com;
       server backend2.example.com;
   }
   ```

2. **权重（Weight）**： 可以根据服务器的性能或负载设置不同的权重，权重越高的服务器将处理更多的请求。

   ```
   upstream myapp {
       server backend1.example.com weight=3;
       server backend2.example.com weight=2;
   }
   ```

3. **IP哈希（IP Hash）**： 通过客户端 IP 地址进行哈希，确保来自同一客户端的请求总是被发送到同一个服务器。

   ```
   upstream myapp {
       ip_hash;
       server backend1.example.com;
       server backend2.example.com;
   }
   ```

4. **最少连接（Least Connections）**： 将请求分配给连接数最少的服务器，适合处理时间不均匀的请求。

   ```
   upstream myapp {
       least_conn;
       server backend1.example.com;
       server backend2.example.com;
   }
   ```

5. **公平（Fair）**（第三方模块）： 根据后端服务器的响应时间来分配请求，响应时间短的服务器将优先分配请求。

   ```
   upstream myapp {
       server backend1.example.com;
       server backend2.example.com;
       fair;
   }
   ```

6. **URL哈希（URL Hash）**（第三方模块）： 根据请求的 URL 进行哈希，确保相同的 URL 请求总是被发送到同一个服务器，适用于缓存实现。

   ```
   upstream myapp {
       hash $request_uri;
       server backend1.example.com;
       server backend2.example.com;
   }
   ```

在实际配置时，你需要在 `http` 块中定义 `upstream` 块，然后在 `server` 块中使用 `proxy_pass` 指令将请求转发到定义的 `upstream` 服务器组。例如：

```
server {
    listen 80;
    location / {
        proxy_pass http://myapp;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

请注意，使用第三方负载均衡策略（如 fair 和 URL hash）可能需要安装额外的 Nginx 模块。此外，根据你的具体需求，可能还需要配置其他相关的 `proxy` 指令，如 `proxy_redirect`、`proxy_set_header` 等。

在应用配置后，使用以下命令来测试 Nginx 配置的语法是否正确，并重启 Nginx 服务：

```
nginx -t
sudo nginx -s reload
```

### 4.5 适配 PC 或移动设备

```nginx
http {
    # 定义一个 map 来简化 user agent 的检查
    map $http_user_agent $is_mobile {
        default 0;
        ~*Mobile.* 1;
        ~*Android.* 1;
        ~*webOS.* 1;
        ~*iPhone.* 1;
        ~*iPod.* 1;
        ~*BlackBerry.* 1;
        ~*Windows Phone.* 1;
    }

    server {
        listen 80;
        server_name www.example.com;

        # 根据设备类型提供不同的网站内容
        location / {
            root /usr/share/nginx/html;
            if ($is_mobile) {
                root /usr/share/nginx/html/mobile;
            }
            index index.html index.htm;
        }

        # 其他配置...
    }
}
```

需要将移动端和PC端的静态资源文件分开放置，也就是需要开发两套代码。

### 4.6 配置图片、字体等静态文件缓存

```nginx
server {
  listen       80;
  server_name  fe.sherlocked93.club;
  
  location / {
    root       /usr/share/nginx/html/dist;  # 静态资源文件夹
    index      index.html index.htm;
    try_files  $uri $uri/ /index.html @rewrites;  
    
    expires -1;                          # 首页一般没有强制缓存
    add_header Cache-Control no-cache;
  }
  
  # 接口转发，如果需要的话
  #location ~ ^/api {
  #  proxy_pass http://be.sherlocked93.club;
  #}
  # 图片缓存时间设置
  location ~ .*\.(css|js|jpg|png|gif|swf|woff|woff2|eot|svg|ttf|otf|mp3|m4a|aac|txt)$ {
    expires 10d;
  }
  
  location @rewrites {
    rewrite ^(.+)$ /index.html break;
  }
}


```

### 4.7 nginx 防盗链配置

```Nginx
http {
    # 其他配置...

    server {
        listen 80;
        server_name yourdomain.com;

        location ~* \.(jpg|jpeg|png|gif|bmp|swf)$ {
            # 允许直接访问和从指定域名访问图片
            valid_referers none blocked server_names *.yourdomain.com;
            if ($invalid_referer) {
                # 如果请求的 Referer 不在允许的列表中，则返回 403 错误
                return 403;
            }
            # 其他图片服务相关配置...
        }

        # 其他配置...
    }
}
```

### 4.8 https 配置

```nginx
http {
    # 配置 HTTPS 的 server 块
    server {
        listen 443 ssl; # 监听 443 端口，并使用 SSL
        server_name www.example.com; # 服务器域名

        # 指定 SSL 证书和私钥文件的路径
        ssl_certificate /path/to/your/certificate.pem;
        ssl_certificate_key /path/to/your/private.key;

        # SSL 密码套件配置，根据需要调整
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers 'ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:ECDHE-RSA-DES-CBC3-SHA:ECDHE-ECDSA-DES-CBC3-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:DES-CBC3-SHA:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!MD5:!PSK:!RC4';

        # 其他 HTTPS 相关配置...
        ssl_prefer_server_ciphers on;
        ssl_session_cache builtin:1000 shared:SSL:10m;
        ssl_session_timeout 5m;

        # 配置网站根目录和默认页面
        root /var/www/html;
        index index.html index.htm;

        # 其他配置...
    }

    # 配置 HTTP 到 HTTPS 的重定向
    server {
        listen 80;
        server_name www.example.com;

        # 所有请求重定向到 HTTPS
        return 301 https://$server_name$request_uri;
    }
}
```



## 5. Nginx 操作常用命令

1. **启动 Nginx 服务**：

   ```
   sudo systemctl start nginx
   ```

2. **停止 Nginx 服务**：

   ```
   sudo systemctl stop nginx
   ```

3. **重新启动 Nginx 服务**：

   ```
   sudo systemctl restart nginx
   ```

4. **检查 Nginx 服务状态**：

   ```
   sudo systemctl status nginx
   ```

5. **使 Nginx 在启动时自动运行**：

   ```
   sudo systemctl enable nginx
   ```

6. **禁用 Nginx 自动运行**：

   ```
   sudo systemctl disable nginx
   ```

7. **重新加载 Nginx 配置**：

   ```
   sudo nginx -s reload
   ```

8. **测试 Nginx 配置文件**：

   ```
   sudo nginx -t
   ```

9. **查看 Nginx 的版本信息**：

   ```
   nginx -v
   ```

10. **查看当前 Nginx 正在使用的配置文件**：

    ```
    nginx -T
    ```

11. **获取 Nginx 的进程信息**：

    ```
    ps aux | grep nginx
    ```

12. **查看 Nginx 的访问日志**：

    ```
    cat /var/log/nginx/access.log
    ```

    日志文件的位置可能会因安装和配置的不同而有所变化。

13. **查看 Nginx 的错误日志**：

    ```
    cat /var/log/nginx/error.log
    ```

14. **杀死 Nginx 的进程**：

    ```
    sudo kill -QUIT `cat /var/run/nginx.pid`
    ```