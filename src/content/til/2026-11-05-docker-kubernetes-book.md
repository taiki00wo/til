---
title: "【読書】イラストでわかるDockerとKubernetes"
date: 2026-11-05T22:37:42+09:00
tags: [docker, kubernetes, book]
draft: true
---

<!-- Zennのスクラップから移行: https://zenn.dev/tnakano/scraps/b530f875209586 -->

Linuxについて学んだので本題

https://gihyo.jp/book/2024/978-4-297-14055-7

## 勉強する動機

- 雰囲気でDockerを書いてしまっている
- GitHub ActionsなどのCI/CDを最適化したい
- Kubernetesは一時期触っていたが理解しきれていない

## Docker

### Dockerの基本概念

- Build：コンテナの材料からコンテナイメージを作成
- Ship：レジストリを用いたイメージの他ホストへの配布
- Run：コンテナイメージからコンテナを実行

### コマンド

- `docker run`：コンテナを作成して起動する
- `docker exec`：起動しているコンテナにコマンドを実行する

### データ永続化

- bind mount：ホストのファイルシステム上の任意の場所をマウント。
- volumes：ホストのファイルシステム上のDocker専用領域にマウント・Dockerが管理。

どちらも「ホストのファイルシステム上」に保存する。Dockerの公式ドキュメントによるとvolumesの利用を推奨している。確かにより隔離されていて、安全なのはvolumesである。  
逆に「bind mountを使うケースは？」ファイル変更がすぐに反映されるので、開発環境でのホットリロードに最適。

### その他

コンテナイメージはレイヤ構造であり、ベースレイヤに差分が上乗せされている  
コンテナは常にホストのリソースを借りて稼働している、と思えばイメージしやすい

### 注意点

本書はハンズオン形式であるが、Linuxでの動作を前提としていて、macOSで`overlayfs`が使えない

**疑問**

- Dockerイメージの種類
- venvなど関連ライブラリのインストールタイミング
- イメージには実体がない？

## Kubernetes

Kubernetesは1つのPodに複数のアプリケーションを同居させることが可能  
「サイドカーコンテナ」と呼ばれるデザインパターンでは、メインのコンテナを補佐するようなサブのコンテナを同居させる

### Pod

- Podは1つ以上のコンテナをひとまとめに扱うことができるデプロイ単位
- KubernetesはIPアドレスをPodごとに払い出す
- 各Podにラベルを付与しセレクタ指定することで一括管理が可能

### デプロイ

- Pod数を`replicas`で指定できる。スケールアウト、セルフヒーリングにより常にPod数を保とうとする
- ローリングアップデート方式をサポートしている

### Podの種類

- `StatefulSet`を使うと各Podを区別して扱う
- `DaemonSet`を使うと各ノードにPodをデプロイする
- `Job`を使うとPodをジョブのように単発実行できる

### 環境変数の持ち方

- `ConfigMap`でコンテナ内に環境変数を保持する
- `Secret`でコンテナイメージに含めず環境変数を保持する

### ボリュームの種類

- `Persistent Volumes`はPodのライフタイムとは独立したデータ永続化のボリューム
- Podから`Persistent Volumes`を利用するには、使用する`PersistentVolume`の条件を記述した`PersistentVolumeClaim`を別途作成する
- `Ephemeral Volumes`はPodと同じライフタイムを持つエフェメラルなボリューム

### サービス公開

- `Service`を用いることで、複数のPodに共通のIPアドレスを付与し1つのサービスのようにアクセスできる
- このIPアドレスはKubernetesクラスタ内だけで有効

### 外部公開できるサービス

- `NodePort Service`はクラスタ外からの通信をPodにロードバランスする
- `LoadBalancer Service`もロードバランサとして使えるが、`NodePort Service`との違いがわからない
- `Ingress`はURLのホスト名やパスルールで宛先のServiceを割り振りできる

### Kubernetes自体

- Kubectlを受け付けるAPIサーバがある？後で確認
- `kubelet`がノード上のPod群の状態を維持
- `CRIランタイム`がイメージ取得やPod・コンテナ群の管理
- `CNIプラグイン`がPodにIPアドレスを払い出し通信をネットワークインターフェースで管理

Open Container Initiative（OCI）という団体がOCIランタイム、イメージ、レジストリの標準仕様を定めており、Docker・Kubernetesは互いに連携可能である。

最後の方の話は難しかったので、また勉強した後に読み返そう

最後に疑問だけ解消したい
Kubernetesとは結局何だったのか？Claudeに手伝ってもらい深掘りする

まず、`kube-apiserver`について

### ① API サーバは Pod として動いている

```console
$ kubectl get pods -n kube-system
NAME                                            READY   STATUS    RESTARTS       AGE
coredns-66bc5c9577-sm6p2                        1/1     Running   0              11d
coredns-66bc5c9577-szxrr                        1/1     Running   0              11d
etcd-desktop-control-plane                      1/1     Running   0              11d
kindnet-sg7zg                                   1/1     Running   0              11d
kindnet-ttblq                                   1/1     Running   0              11d
kube-apiserver-desktop-control-plane            1/1     Running   0              11d
kube-controller-manager-desktop-control-plane   1/1     Running   1 (3d1h ago)   11d
kube-proxy-gtkrb                                1/1     Running   0              11d
kube-proxy-vp8mc                                1/1     Running   0              11d
kube-scheduler-desktop-control-plane            1/1     Running   1 (3d1h ago)   11d
```

これをみると`kube-apiserver-desktop-control-plane`が動いている

### ② kubectl の接続先は ~/.kube/config に書いてある

```console
$ kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}'

https://127.0.0.1:64722
```

kubectlはクライアントで`port:64722`に送信する設定になっている

### ③ kubectl は HTTP リクエストを送っているだけ

```console
$ kubectl run nginx --image nginx

pod/nginx created

$ kubectl get pods -v=6
I1105 22:23:33.732457   83686 cmd.go:527] kubectl command headers turned on
I1105 22:23:33.737799   83686 loader.go:402] Config loaded from file:  /Users/user_name/.kube/config
I1105 22:23:33.738173   83686 envvar.go:172] "Feature gate default state" feature="WatchListClient" enabled=false
I1105 22:23:33.738186   83686 envvar.go:172] "Feature gate default state" feature="ClientsAllowCBOR" enabled=false
I1105 22:23:33.738208   83686 envvar.go:172] "Feature gate default state" feature="ClientsPreferCBOR" enabled=false
I1105 22:23:33.738217   83686 envvar.go:172] "Feature gate default state" feature="InOrderInformers" enabled=true
I1105 22:23:33.738221   83686 envvar.go:172] "Feature gate default state" feature="InformerResourceVersion" enabled=false
I1105 22:23:33.751784   83686 round_trippers.go:632] "Response" verb="GET" url="https://127.0.0.1:64722/api/v1/namespaces/default/pods?limit=500" status="200 OK" milliseconds=9
NAME    READY   STATUS              RESTARTS   AGE
nginx   0/1     ContainerCreating   0          5s
```

適当にPodを作って`kubectl get`すると、`url="https://127.0.0.1:64722/api/v1/namespaces/default/pods?limit=500"`にAPIリクエストを送っていることが確認できた

ここでKubernetesとは、という問いに戻ると、公式サイトで確認

![Kubernetesのコンポーネント](/images/docker-kubernetes-book/components-of-kubernetes.svg)
出典: [Kubernetes Components | Kubernetes](https://kubernetes.io/docs/concepts/overview/components/)（CC BY 4.0）

複数のプログラムを持つ仕組みをまとめてKubernetesと呼んでいることを理解した

- `Control Plane Components`というクラスターをマネージメントする
- `Node Components`というPodを作成したり通信を整備したりする
