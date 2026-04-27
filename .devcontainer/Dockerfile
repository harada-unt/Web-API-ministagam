# Dockerfile for devcontainer
# This extends the existing Backend Dockerfile with development utilities

ARG PHP_VERSION="8.3"
ARG LARAVEL_VERSION="12.*"
ARG PUBLIC_DIR="app/public"

FROM php:${PHP_VERSION}-apache

ARG USERNAME="vscode"

# 環境変数
ENV APACHE_RUN_GROUP=$USERNAME \
    APACHE_RUN_USER=$USERNAME \
    PHP_MAX_EXECUTION_TIME=30 \
    PHP_MEMORY_LIMIT=128M \
    PHP_VARIABLES_ORDER=EGPCS \
    PHP_POST_MAX_SIZE=10M \
    PHP_UPLOAD_MAX_FILESIZE=10M \
    PHP_MAX_FILE_UPLOADS=20 \
    XDEBUG_MODE=off \
    XDEBUG_START_WITH_REQUEST=default \
    XDEBUG_LOG_LEVEL=7 \
    XDEBUG_CLIENT_HOST=host.docker.internal \
    XDEBUG_CLIENT_PORT=9003 \
    XDEBUG_IDEKEY=VSCODE

# Install base packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    apt-utils \
    git \
    imagemagick \
    libfreetype6-dev \
    libjpeg-dev \
    libmagickwand-dev \
    libpng-dev \
    libwebp-dev \
    libzip-dev \
    mercurial \
    nodejs \
    npm \
    sudo \
    unzip \
    zip \
    vim \
    curl \
    wget

# PHP Extensions Configure
RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg=/usr \
    --with-webp

# PHP Extensions Install
RUN docker-php-ext-install -j$(nproc) \
    bcmath \
    ctype \
    curl \
    dom \
    exif \
    filter \
    fileinfo \
    gd \
    hash \
    iconv \
    imagick \
    json \
    libxml \
    mbstring \
    openssl \
    pcre \
    pdo \
    pdo_mysql \
    reflection \
    spl \
    tokenizer \
    xml \
    xmlreader \
    xmlwriter \
    zip

# Xdebug Install
RUN pecl install xdebug && docker-php-ext-enable xdebug

# Apache modules enable
RUN a2enmod rewrite
RUN a2enmod headers
RUN a2enmod negotiation

# Composer Install
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('composer-setup.php');"

# Create vscode user and set up sudo
RUN useradd -m -s /bin/bash ${USERNAME} && \
    usermod -aG sudo ${USERNAME} && \
    echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/nopasswd

# Set Apache configuration
RUN { \
    echo '<Directory /var/www/app>'; \
    echo '    Options Indexes FollowSymLinks'; \
    echo '    AllowOverride All'; \
    echo '    Require all granted'; \
    echo '</Directory>'; \
} > /etc/apache2/conf-available/app.conf

RUN a2enconf app

# Set document root
ARG PUBLIC_DIR
RUN { \
    echo '<VirtualHost *:80>'; \
    echo '    ServerAdmin admin@example.com'; \
    echo '    DocumentRoot /var/www/app/'${PUBLIC_DIR}; \
    echo '</VirtualHost>'; \
} > /etc/apache2/sites-available/000-default.conf

# Set working directory
WORKDIR /var/www/app

# Switch to vscode user
USER ${USERNAME}

CMD ["apache2-foreground"]
