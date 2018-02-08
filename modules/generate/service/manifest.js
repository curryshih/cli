
// service:
//   name: activitystore
//   namespaces:
//     dev: dev
//     test: dev
//     minikube: dev
//     prod: prod
//   clusters:
//     dev: gke_veltra-platform_asia-east1-a_congaree-dev-front
//     test: gke_veltra-platform_asia-east1-a_congaree-test-front
//     minikube: minikube
//     prod: gke_veltra-platform_asia-east1-a_congaree-prod-front
// deploy:
// - scripts:
//   - rm -rf .build; mkdir .build
// - name: Deployment
//   conditions:
//     "<%= argv.env %>": { oneOf: [dev, test, prod] }
//     "<%= argv.task %>": deploy
//   scripts:
//   - make ccp SERVICE=<%=service.name%> NAMESPACE=<%= service.namespaces[argv.env] %> CLUSTER=<%=service.clusters[argv.env]%> TASK=deploy
//   - find .build -name "*.yaml" -exec kubectl --cluster=<%=service.clusters[argv.env]%> --namespace=<%= service.namespaces[argv.env] %> apply -f {} \;
// - name: Deploy Minikube
//   conditions:
//     "<%= argv.env %>": minikube
//     "<%= argv.task %>": deploy
//   scripts:
//   - make build_std SERVICE=<%= service.name %>
//   - eval $(minikube docker-env)
//   - make ccp_mini SERVICE=<%= service.name %> NAMESPACE=<%= service.namespaces[argv.env] %> CLUSTER=<%= service.clusters[argv.env] %> TASK=deploy
//   - eval $(docker-machine env -u)
//   - find .build -name "*.yaml" -exec kubectl --cluster=<%= service.clusters[argv.env] %> --namespace=<%= service.namespaces[argv.env] %> apply -f {} \;
// - name: Rollback
//   conditions:
//     "<%= argv.env %>": { oneOf: [dev, test, minikube, prod] }
//     "<%= argv.task %>": rollback
//   scripts:
//   - kubectl scale deployment/<%=service.name%>-canary --replicas=0 --cluster=<%=service.clusters[argv.env]%> --namespace=<%= service.namespaces[argv.env] %>
// - name: Upgrade
//   conditions:
//     "<%= argv.env %>": { oneOf: [dev, test, minikube, prod] }
//     "<%= argv.task %>": rollforward
//   scripts:
//   - image=`kubectl get deployment <%=service.name%>-canary -o wide --cluster=<%=service.clusters[argv.env]%> --namespace=<%= service.namespaces[argv.env] %> | grep <%=service.name%>-canary | awk '{print $8}'`
//   - docker run -i -v `pwd`:`pwd` -w `pwd` gcr.io/veltra-platform/buildtool:latest node /scripts/parse.js manifest.yaml k8s --namespace=<%= service.namespaces[argv.env] %> --cluster=<%=service.clusters[argv.env]%> --task=rollforward --image=$image
//   - find .build -name "*.yaml" -exec kubectl --cluster=<%=service.clusters[argv.env]%> --namespace=<%= service.namespaces[argv.env] %> apply -f {} \;
// k8s:
// - name: Dev configuration
//   conditions:
//     "<%= argv.namespace %>": dev
//   files:
//   - input: ./k8s/config.yaml
//     output: ./.build/config.o.yaml
// - name: Dev Deployment
//   conditions:
//     "<%= argv.cluster %>": { oneOf: [gke_veltra-platform_asia-east1-a_congaree-dev-front, gke_veltra-platform_asia-east1-a_congaree-test-front, gke_veltra-platform_asia-east1-a_congaree-dev-ingestion, minikube] }
//     "<%= argv.namespace %>": dev
//     "<%= argv.task %>": deploy
//   files:
//   - input: ./k8s/k8s.yaml
//     output: ./.build/k8s-dev.o.yaml
//     targets:
//     - matches:
//         kind: Deployment
//         metadata.name: activitystore
//       action: overwrite
//       apply:
//         spec.replicas: 1
//         spec.template.metadata.labels.track: canary
//         metadata.name: <%=service.name%>-canary
//         spec.template.spec.containers.0.image: "<%= argv.image %>"
//         spec.template.spec.containers.0.resources.requests.cpu: "10m"
//         spec.template.spec.containers.0.resources.limits.cpu: "500m"
//       push:
//         spec.template.spec.containers.0.env:
//           name: LOG_SEVERITY_LEVEL
//           value: info
// - name: Dev Canary Update
//   conditions:
//     "<%= argv.cluster %>": { oneOf: [gke_veltra-platform_asia-east1-a_congaree-dev-front, gke_veltra-platform_asia-east1-a_congaree-test-front, gke_veltra-platform_asia-east1-a_congaree-dev-ingestion, minikube] }
//     "<%= argv.namespace %>": dev
//     "<%= argv.task %>": rollforward
//   files:
//   - input: ./k8s/k8s.yaml
//     output: ./.build/k8s-dev.o.yaml
//     targets:
//     - matches:
//         kind: Deployment
//         metadata.name: activitystore
//       action: overwrite
//       apply:
//         spec.replicas: 0
//         spec.template.metadata.labels.track: canary
//         metadata.name: <%=service.name%>-canary
//         spec.template.spec.containers.0.image: "<%= argv.image %>"
//     - matches:
//         kind: Deployment
//         metadata.name: activitystore
//       action: overwrite
//       apply:
//         spec.replicas: 1
//         spec.template.metadata.labels.track: stable
//         metadata.name: <%=service.name%>-stable
//         spec.template.spec.containers.0.image: "<%= argv.image %>"
//         spec.template.spec.containers.0.resources.requests.cpu: "10m"
//         spec.template.spec.containers.0.resources.limits.cpu: "500m"
// - name: Prod configuration
//   conditions:
//     "<%= argv.namespace %>": prod
//   files:
//   - input: ./k8s/config.yaml
//     output: ./.build/config.o.yaml
//     targets:
//     - matches:
//         kind: ConfigMap
//       action: overwrite
//       apply:
//         metadata.namespace: prod
//         data.bigtable-table-activity: prod-activity
//         data.bigtable-table-plan: prod-plan
//         data.bigtable-table-plan-item: prod-plan_item
// - name: Prod Deployment
//   conditions:
//     "<%= argv.namespace %>": prod
//     "<%= argv.task %>": deploy
//   files:
//   - input: ./k8s/k8s.yaml
//     output: ./.build/k8s-prod.o.yaml
//     targets:
//     - matches:
//         kind: Deployment
//         metadata.name: activitystore
//       action: overwrite
//       apply:
//         spec.replicas: 1
//         spec.template.metadata.labels.track: canary
//         metadata.name: <%=service.name%>-canary
//         spec.template.spec.containers.0.image: "<%= argv.image %>"
//         spec.template.spec.containers.0.resources.requests.cpu: "200m"
//         spec.template.spec.containers.0.resources.limits.cpu: "800m"
// - name: Prod Canary Update
//   conditions:
//     "<%= argv.namespace %>": prod
//     "<%= argv.task %>": rollforward
//   files:
//   - input: ./k8s/k8s.yaml
//     output: ./.build/k8s-prod.o.yaml
//     targets:
//     - matches:
//         kind: Deployment
//         metadata.name: activitystore
//       action: overwrite
//       apply:
//         spec.replicas: 0
//         spec.template.metadata.labels.track: canary
//         metadata.name: <%=service.name%>-canary
//         spec.template.spec.containers.0.image: "<%= argv.image %>"
//     - matches:
//         kind: Deployment
//         metadata.name: activitystore
//       action: overwrite
//       apply:
//         spec.replicas: 2
//         spec.template.metadata.labels.track: stable
//         metadata.name: <%=service.name%>-stable
//         spec.template.spec.containers.0.image: "<%= argv.image %>"
//         spec.template.spec.containers.0.resources.requests.cpu: "200m"
//         spec.template.spec.containers.0.resources.limits.cpu: "800m"

