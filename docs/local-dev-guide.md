# local dev guide
基于 `release-4.11` 版本开发

1. 根据[文档说明](../README.md#build-everything)进行编译(frontend/backend)
2. [配置参数启动](../README.md#native-kubernetes)

本地运行示例：
```shell
KUBERNETES_SERVICE_HOST=10.255.0.50 KUBERNETES_SERVICE_PORT=6443 ./bin/bridge \
  --base-address=http://localhost:9000 \
  --k8s-auth=bearer-token \
  --k8s-mode=off-cluster \
  --k8s-mode-off-cluster-endpoint="https://10.255.0.50:6443" \
  --k8s-mode-off-cluster-skip-verify-tls=true \
  --listen=http://127.0.0.1:9000 \
  --public-dir=./frontend/public/dist \
  --user-auth=disabled \
  --k8s-auth-bearer-token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjhLUWZxcXo3UjNyejJjOVNHNFlrVldBN2JWXzUwOTByeU9namNRQU5QLTQifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImRlZmF1bHQtdG9rZW4tbnQybm0iLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiZGVmYXVsdCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6ImQ0MDJkMTFiLWE4NmUtNGQ3Yi1iYTc2LTQyNTgxYjM0NDJlNSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmRlZmF1bHQifQ.am-jsAALyXMGjxZJ7Sh5302EI4a061ekUfY_CcRD3f8y7JLdOTpKB-SqxaPRexFKZQ3RbM3egZnoz5iTa2NXwkQGvmd5c66Er57rrEKZOU7OenKGcnBuVej-F5VdIpYfM93Zdz7FKUFx07L_PlHTw-taA8y4PRfsHn14aOnUB8pma3sv1ri8O3SGiEga7489XbyMQmbM1FdyfFol5aO13JqGn2o_avFtFH7fGgfoL5BgW6aaMoPGiAPn86qDnKqEHvqNWsCfQMEo7c5LukK1Fr2xc8qTHqCy4I2suGtOwf5GMLhnmvdxkQXNgHljjPZ9Z2YnLNNrl8xDqOPzgAywYw
```

## web-terminal 插件

运行 web-terminal 前置条件：
1. 机器安装 [operator-sdk](https://github.com/operator-framework/operator-sdk/releases)
2. 通过 operator-sdk 安装 OLM(`operator-sdk olm install`)
   i. 会部署 olm operator
3. 通过 OLM 安装 web-terminal-operator
   i. 添加 [CatalogSource](https://github.com/redhat-developer/web-terminal-operator/blob/main/catalog-source.yaml)
   i. web-terminal-operator 会自动安装 devworkspace-operator 依赖
4. 【省略】通过 OLM 安装 devworkspace-operator 或者直接通过 [manifests](https://github.com/devfile/devworkspace-operator/blob/v0.26.0/deploy/deployment/kubernetes/combined.yaml) 文件直接部署 
   i. 添加 CatalogSource
   i. 再通过 OperatorHub 安装 devworkspace operator
   i. 手动添加 devworkspace operator webhook cert-manager 配置后，安装成功
5. 默认以 in-cluster 运行模式，配置 serviceaccount 信息(`kubernetes.default`)，或者部署 namespace default（权限问题）
```shell
sudo mkdir -p /var/run/secrets/kubernetes.io/serviceaccount
sudo vim /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
sudo vim /var/run/secrets/kubernetes.io/serviceaccount/token
```

### [代码逻辑](../pkg/terminal/proxy.go#L179)：
1. terminal icon 显示
   i. [web terminal 插件路由注册](../pkg/server/server.go#L337)
   i. 判断是否安装 web-terminal-operator(`kubectl get subscriptions -A --field-selector='metadata.name=web-terminal'`)
   i. 判断 webhook 是否启动
      i. 创建 kubernetes REST client(service account)，判断是否运行在集群内（根据 `KUBERNETES_SERVICE_HOST`,`KUBERNETES_SERVICE_PORT` 判断），读取 Pod `serviceaccount` 证书信息。每个 pod 会默认生成 `serviceaccount` 并注入到 pod 中。(用于 `api-server` 认证 )`/var/run/secrets/kubernetes.io/serviceaccount/token`
      i. `kubectl get mutatingwebhookconfigurations controller.devfile.io`
      i. `kubectl get validatingwebhookconfigurations controller.devfile.io`
2. 运行 terminal
   i. 前端请求 `/api/kubernetes/apis/workspace.devfile.io/v1alpha2/namespaces/openshift-terminal/devworkspaces`
   i. 

### 问题：
1. 影响 Pod exec（`kubectl exec -ti`）,需要删除 webhook，原因是 webhook 证书问题
   i. `kubectl delete mutatingwebhookconfigurations controller.devfile.io`
   i. `kubectl delete validatingwebhookconfigurations controller.devfile.io`