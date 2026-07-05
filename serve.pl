use strict;
use warnings;
use IO::Socket::INET;
use File::Basename;
use POSIX qw();

my $port = 3000;
my $root = dirname(__FILE__);

my $server = IO::Socket::INET->new(
    LocalPort => $port,
    Type      => SOCK_STREAM,
    Reuse     => 1,
    Listen    => 10,
) or die "Cannot bind: $!";

print "Serving $root on http://localhost:$port\n";
$| = 1;

my %mime = (
    html => 'text/html; charset=utf-8',
    css  => 'text/css',
    js   => 'application/javascript',
    png  => 'image/png',
    jpg  => 'image/jpeg',
    jpeg => 'image/jpeg',
    webp => 'image/webp',
    svg  => 'image/svg+xml',
    ico  => 'image/x-icon',
    xml  => 'application/xml',
    json => 'application/json',
    woff2=> 'font/woff2',
    woff => 'font/woff',
);

while (my $client = $server->accept()) {
    my $req = '';
    while (my $line = <$client>) {
        $req .= $line;
        last if $line =~ /^\r?\n$/;
    }
    my ($method, $path) = $req =~ /^(\w+) ([^\s]+)/;
    $path =~ s/\?.*//;
    $path =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/ge;
    $path = '/' if $path eq '';
    $path .= 'index.html' if $path =~ /\/$/;
    my $file = $root . $path;
    $file =~ s|/|\\|g;
    if (-f $file) {
        my ($ext) = $file =~ /\.(\w+)$/;
        my $ct = $mime{lc($ext||'')} || 'application/octet-stream';
        open my $fh, '<:raw', $file or do {
            print $client "HTTP/1.1 403 Forbidden\r\n\r\n";
            close $client; next;
        };
        my @stat = stat($file);
        my $size = $stat[7];
        print $client "HTTP/1.1 200 OK\r\nContent-Type: $ct\r\nContent-Length: $size\r\nConnection: close\r\n\r\n";
        my $buf;
        print $client $buf while read($fh, $buf, 8192);
        close $fh;
    } else {
        print $client "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nNot found: $path";
    }
    close $client;
}
