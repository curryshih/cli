module.exports = () => `package main

import (
	"flag"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"golang.org/x/net/context"

	"google.golang.org/grpc"

	"github.com/gokums/core/log"
	"github.com/gokums/core/net/httpx"
)

var (
	rpcBind  = flag.String("rpc", ":9999", "$host:$port to bind for rpc")
	httpBind = flag.String("http", ":8080", "$host:$port to bind for http")
)

func init() {
	flag.Parse()
}

func main() {

	ctx := context.Background()
	handler := httpx.NewHandler()

	go func() {
		if err := http.ListenAndServe(*httpBind, handler); err != nil {
			log.Fatalf("failed to listen and serve http: %v", err)
		}
	}()

	srv := grpc.NewServer()
	// Register the pb server
	// protobufpb.RegisterServer(srv, rpc.NewRPC())
	grpc_prometheus.Register(srv)

	lis, err := net.Listen("tcp", *rpcBind)
	if err != nil {
		log.Fatalf("failed to listen rpc: %v", err)
	}

	go func() {
		if err := srv.Serve(lis); err != nil {
			log.Fatalf("failed to serve rpc: %v", err)
		}
	}()

	term := make(chan os.Signal)
	signal.Notify(term, syscall.SIGTERM)
	<-term
	srv.GracefulStop()
}
`;
