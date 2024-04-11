#!/usr/bin/env bash

set -exuo pipefail

./bin/bridge \
    --listen=http://0.0.0.0:9000 \
    --base-address=http://localhost:9000 \
    --public-dir=./frontend/public/dist \
    --k8s-auth=bearer-token \
    --k8s-mode=off-cluster \
    --k8s-mode-off-cluster-endpoint="https://kubernetes.default.svc:443" \
    --k8s-mode-off-cluster-skip-verify-tls=true \
    --user-auth=disabled \
    --k8s-auth-bearer-token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjhLUWZxcXo3UjNyejJjOVNHNFlrVldBN2JWXzUwOTByeU9namNRQU5QLTQifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJkZWZhdWx0LXRva2VuLWI0ZzJuIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImRlZmF1bHQiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiIyODdmYWIwYy0zNjc5LTRmZjYtYjViYi0xNTFlN2FiMGQxZDgiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6a3ViZS1zeXN0ZW06ZGVmYXVsdCJ9.W2nWiKuR_O2pfnvalP7EOh9tHo_rC0aYFchfJTF7uIZ2Cfmhi52QY-q837iZQLn1-3D4EavFXDqnnRUedoDkXVUSKd_tHai1qqKXqZFvsqtNq1tnMyLbqf_FPXVTf3V8386wmPclH3lUYoOlngfwiFSiH5FMiTLP01rekKhXF5QfrIXCSlD-mMrSv8NgBAXNJNgaV1ujOdWMtje6L4yof634aorb3JR7k3IXfwwb0UXHpbZD8rkyXNXz-UY-ylOJxBUhVIW8rhVdKcmTYScdNF1M7BwfUtZpB2ZuiaCxspjUNBq1busbZdrQTNj1LB-zjL6cWPm3i-nsngixkc45xg
