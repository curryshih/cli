module.exports = (rtMf, svcMf) => `package main

import (
	"flag"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"${rtMf.package}/src/service/${svcMf.service.path}/args"

	"google.golang.org/grpc"

	"github.com/gokums/core/log"
	"github.com/gokums/core/net/httpx"
)

func init() {
	flag.Parse()
}

func main() {

	// ctx := context.Background()
	handler := httpx.NewHandler()

	go func() {
		if err := http.ListenAndServe(*args.HTTPBind, handler); err != nil {
			log.Fatalf("failed to listen and serve http: %v", err)
		}
	}()

	srv := grpc.NewServer()
	// Register the pb server
	// protobufpb.RegisterServer(srv, rpc.NewRPC())
	// grpc_prometheus.Register(srv)

	// muxSrv := runtime.NewServeMux(runtime.WithMarshalerOption("*", &gateway.JSONPb{OrigName: true}))
	// opts := []grpc.DialOption{grpc.WithInsecure(), grpc.WithBlock()}
	// err = vdsmixerpb.RegisterGwMixerHandlerFromEndpoint(ctx, muxSrv, "localhost"+*args.RPCBind, opts)
	// if err != nil {
	// 	log.Fatalf("register endpoint failed: %v", err)
	// }
	// handler.Handle("/v1/", muxSrv)

	lis, err := net.Listen("tcp", *args.RPCBind)
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
