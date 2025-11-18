FROM amazonlinux:2

# Apache 2.4 のインストール
RUN yum update -y && \
    yum install -y httpd && \
    yum clean all

# Apache のドキュメントルートディレクトリ作成
RUN mkdir -p /var/www/html

# ホストマシンの app ディレクトリ内のファイルをコンテナにコピー
COPY . /var/www/html/

# Apache がコンテナ起動時に前景で動作するよう設定
EXPOSE 80

# Apache を起動
CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]