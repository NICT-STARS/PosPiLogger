# PosPiLogger
Raspberry Pi PosPiLogger Web システム

１．サーバアプリーション

（１）インストール方法

　　※インストール先はWebサーバになります。
　　※予めNode.js（およびnpm）をインストールしておいて下さい。
　　　（「３．（１）」参照。動作確認済みVer：node v6.14.2 / v8.11.2）
　　※予めMongoDBをインストールしておいて下さい。
　　　（「３．（５）」参照。動作確認済みVer：3.6）

　　①serverフォルダ一式を適当な場所にコピーします。

　　②カレントディレクトリをserverに移動します。
　　　例：cd server

　　③アプリケーションに必要なNode.jsパッケージをインストールします。成功すると
　　　serverフォルダ配下にnode_modulesフォルダが作成され依存関係のあるパッケージ
　　　が一括インストールされます。
　　　例：npm install

（２）各種設定

　　server/config/default.jsonを開き以下の設定をして下さい。

　　①ポート番号
　　　例："port" : 8080,
　　　※アプリケーションがバインドするポート番号を設定して下さい。

　　②位置情報保存先データベース
　　　例："mongoDb" : { "auth":"user:pwd", "host":"127.0.0.1:27017", "database":"db_name", "collection":"PosPiLogger" },
　　　※"auth"にMongoDBへログインするためのユーザ名とパスワードを設定して下さい。
　　　　ユーザ名とパスワードはコロン（:）で区切ります。
　　　※"host"にMongoDBのサーバ情報（IPアドレスやポート番号）を設定して下さい。
　　　　IPアドレスとポート番号はコロン（:）で区切ります。MongoDBが同一サーバ上の
　　　　場合、IPアドレスは"127.0.0.1"となります。また、MongoDBはデフォルトでは
　　　　27017番ポートにバインドされます。
　　　※"database"に接続するデータベース名を設定して下さい。
　　　※"collection"に接続するコレクション名を設定して下さい。
　　　※予めMongoDB上にデータベース及びアクセス用ユーザ、コレクションを作成して
　　　　おく必要があります。（「３．（５）」参照）

（３）起動方法

　　①カレントディレクトリをserverに移動します。
　　　例：cd server

　　②アプリケーションを起動します。
　　　例：node app.js

（４）アクセス方法

　　各種デバイスのブラウザからアプリケーションにアクセスして下さい。
　　　例：http://xxx.xxxxx.xx.xx:8080
　　　※ポート番号は「１．（２）①」で指定した値となります。

（５）終了方法

　　キーボードよりCtrl+Cを入力しプロセスに対しSIGINTシグナルを送信する事で終了し
　　ます。


２．送信RP側アプリケーション

（１）インストール方法

　　※インストール先は送信RPになります。
　　※予めNode.js（およびnpm）をインストールしておいて下さい。
　　　（「３．（１）」参照。動作確認済みVer：node v6.14.2 / v8.11.2）

　　①transmitterフォルダ一式を適当な場所にコピーします。

　　②カレントディレクトリをtransmitterに移動します。
　　　例：cd transmitter

　　③アプリケーションに必要なNode.jsパッケージをインストールします。成功すると
　　　transmitterフォルダ配下にnode_modulesフォルダが作成され依存関係のあるパッ
　　　ケージが一括インストールされます。
　　　例：npm install

（２）各種設定

　　transmitter/config/default.jsonを開き以下の設定をして下さい。

　　①デバイス名
　　　例："device" : "device01",
　　　※半角英数のみ（スペース不可）で指定して下さい。
　　　※複数台の送信RPを運用する場合は、それぞれユニーク（一意）な名前にして下さい。

　　②サーバ側アプリケーションのURL
　　　例："server" : { "url":"http://xxx.xxxxx.xx.xx:8080/transmitter", "folder":"", "authorization":"" },
　　　※"url"のポート番号は「１．（２）①」で指定した値となります。
　　　※"url"の末尾は必ず/transmitterとして下さい。
　　　※"folder"及び"authorization"は通常は使用しません。（「３．（６）」参照）

　　③ログ取得コマンド
　　　例："getLog" : { "command":"cat", "args":["/home/pi/fifo"] }
　　　※PosPiLoggerからFIFOで出力されるjson情報を標準出力するためのコマンドを指
　　　　定して下さい。
　　　※"command"にはコマンドの実行ファイル名を指定して下さい。
　　　※"args"にはコマンドライン引数を配列で指定して下さい。

（３）起動方法

　　①カレントディレクトリをtransmitterに移動します。
　　　例：cd transmitter

　　②アプリケーションを起動します。
　　　例：node app.js

　　※正常に動作するとサーバ側アプリケーション（Webアプリケーション）の地図上に
　　　位置情報が表示されます。

（４）終了方法

　　キーボードよりCtrl+Cを入力しプロセスに対しSIGINTシグナルを送信する事で終了し
　　ます。


３．補足資料

（１）Node.jsのインストール例

　　①nvmをインストールします。
　　　curl -o- https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
　　　exit
　　　※インストール後、必ず一旦exitして下さい

　　②インストール可能なNode.jsのバージョン確認します。
　　　nvm ls-remote

　　③バージョンを指定してNode.jsをインストールします。
　　　nvm install x.xx.x

（２）Node.jsアプリケーションをデーモン化する方法

　　foreverというNode.jsパッケージを使うことでNode.jsアプリケーションをデーモン
　　化する事が出来ます。foreverはNode.jsアプリケーションの死活監視ツールです。

　　foreverはNode.jsパッケージですのでnpmを使ってインストールします。
　　例：npm install forever -g

　　Node.jsアプリケーションをデーモン化して起動する場合は、foreverコマンドを
　　startオプションで実行します。
　　例：cd transmitter
　　　　forever start -m 0 -a -l `pwd`/log/app.log --sourceDir `pwd` --killSignal SIGINT app.js
　　　※各アプリケーションフォルダにあるforever_start.shをご利用下さい。

　　デーモン化して起動したNode.jsアプリケーションを停止する場合は、foreverコマン
　　ドのstopオプションで実行します。
　　例：forever stop xxxxx

（３）OS起動時にNode.jsアプリケーションを自動起動する方法

　　crontabでreboot時のスケジュールにNode.jsアプリケーションの起動スクリプトを登
　　録します。
　　例：crontab -e
　　　　@reboot cd /home/pi/transmitter/ ; /bin/bash --login -i -c 'sh ./forever_start.sh 1> cron.log 2> cron_err.log'

（４）Node.jsアプリケーションのログをローテーションする方法

　　logrotateでNode.jsアプリケーションのログローテーションを設定します。

　　①/etc/logrotate.dディレクトリに適当なファイル名で下記内容を保存します。
　　　例：vi /etc/logrotate.d/transmitter
　　　　　/home/pi/transmitter/log/app.log {
　　　　　  daily
　　　　　  rotate 7
　　　　　  copytruncate
　　　　　  missingok
　　　　　  notifempty
　　　　　  dateext
　　　　　}

　　②デバッグ実行して動作確認します。
　　　例：logrotate -dv /etc/logrotate.d/transmitter

　　③スケジュールされた日時にローテーションが行われなかった場合、1度だけ強制実
　　　行する事で以降、実行されるようになる場合があります。
　　　例：logrotate -fv /etc/logrotate.d/transmitter

（５）MongoDB Ver3.6のインストール例（CentOS系）

　　①リポジトリを登録します。
　　　sudo vi /etc/yum.repos.d/mongodb-org-3.6.repo
　　　[mongodb-org-3.6]
　　　name=MongoDB Repository
　　　baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.6/x86_64/
　　　gpgcheck=1
　　　enabled=1
　　　gpgkey=https://www.mongodb.org/static/pgp/server-3.6.asc

　　②MongoDBをインストールします。
　　　sudo yum install -y mongodb-org

　　③MongoDBを起動します。
　　　sudo service mongod start

　　④管理用ユーザを登録します。
　　　mongo
　　　> use admin;
　　　> db.createUser({ user:"kanri_user", pwd:"kanri_pwd", roles:[ { role:"root", db:"admin" } ] });
　　　> exit

　　⑤MongoDBのセキュリティ設定をします。
　　　sudo vi /etc/mongod.conf
　　　...
　　　net:
　　　  port: 27017
　　　  bindIp: 127.0.0.1
　　　...
　　　security:
　　　  authorization: enabled
　　　...
　　　※bindIp: 127.0.0.1で同一ホスト上からのアクセスのみ許可します。
　　　※authorization: enabledでユーザ認証を有効にします。

　　⑥MongoDBを再起動します。
　　　sudo service mongod restart

　　⑦データベース及びアクセス用ユーザ、コレクション、インデックスを作成します。
　　　mongo admin -u kanri_user -p kanri_pwd
　　　> use db_name;
　　　> db.createUser({ user:"user", pwd:"pwd", roles: [ { role:"readWrite", db:"db_name" } ] });
　　　> db.createCollection("PosPiLogger");
　　　> db.PosPiLogger.createIndex({ "GNSS.time": 1 });
　　　> exit

　　⑧MongoDBのバックアップコマンド
　　　mongodump --authenticationDatabase <DB> -u <USER> -p <PWD> -d <DB> -o <PATH>
　　　※<DB>　・・・データベース名
　　　※<USER>・・・ユーザ名
　　　※<PWD> ・・・パスワード
　　　※<PATH>・・・出力先ディレクトリ

　　⑨MongoDBのリストアコマンド
　　　mongorestore --authenticationDatabase <DB> -u <USER> -p <PWD> -d <DB> <PATH>
　　　※<DB>　・・・データベース名
　　　※<USER>・・・ユーザ名
　　　※<PWD> ・・・パスワード
　　　※<PATH>・・・バックアップファイル

（６）NginxをNode.jsアプリケーションのリバースプロキシとして設定する方法

　　サーバ側アプリーション（Webアプリケーション）を80番ポート以外にバインドする
　　場合（80番ポートにバインドするにはroot権限が必要）、エンドユーザはブラウザで
　　URLにポート番号も合わせて指定する必要があります。また、サブフォルダに分けた
　　URL（http://xxx.xxxxxx.xx/appname/ 等）でサーバ側アプリケーションを公開したい
　　場合もあるかと思います。その様な場合は、NginxをNode.jsアプリケーションのリバ
　　ースプロキシとして設定をする事で回避出来ます。

　　リクエスト「http://xxx.xxxxxx.xx/appname/」をlocalhost（127.0.0.1）の8080ポー
　　トで稼働中のサーバ側アプリーションへ転送する場合のNginx設定ファイルの例
    ...

    server
    {
      ...

      location /appname/
      {
        proxy_pass http://127.0.0.1:8080/;
        proxy_http_version 1.1; 
        proxy_set_header Upgrade $http_upgrade; 
        proxy_set_header Connection "upgrade"; 
      }

      ...
    }

    ...

　　※Nginxをリバースプロキシにする場合は「１．（４）」「２．（２）②」のurlは適
　　　時読み替えて下さい。またlocationでフォルダ名を割り当てた場合は「２．（２）
　　　②」のfolderも合わせて設定して下さい。

　　※Nginxで当該locationに対しBASIC認証を設定した場合は、「２．（２）②」の
　　　authorizationにユーザ名とパスワードをコロン（:）で区切って設定して下さい。
　　　例："authorization":"username:password"
