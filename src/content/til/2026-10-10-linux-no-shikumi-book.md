---
title: "【読書】Linuxのしくみ"
date: 2026-10-10T13:55:25+09:00
tags: [linux, book]
---

<!-- Zennのスクラップから移行: https://zenn.dev/tnakano/scraps/452a5cb9843d40 -->

https://gihyo.jp/book/2022/978-4-297-13148-7

**学ぶにいたった背景**

- Docker・Kubernetesについて知識を深めたい
- そういえばOSについて人に説明できるほど詳しくないな
- 目次を見ると最後の章でコンテナについて触れている
- OSからコンテナについて順番に学べて良さそう

**環境構築**  
Ubuntu 20.04をMac上で動作させる必要がある

Docker環境にUbuntuを構築できるDockerfileを公開していたので参考にした
https://github.com/Msksgm/linux-in-practice-2nd-docker

---

x86_64アーキテクチャとは？arm64との違いは？

何となくでしか理解していなかったが、アセンブリコードレベルで違いがある

x86_64アーキテクチャ

```
 mov    $0x6e,%eax
 syscall
```

arm64アーキテクチャ

```
 mov     x8,  <システムコール番号>
 svc     #0
```

---

複数の論理CPUで負荷分散して実行する実験を行ったが、処理時間が短縮されない

```
root@64ade9b44ada:/linux-in-practice-2nd/03-process-scheduler# ./multiload.sh -m 2

real    0m5.335s
user    0m2.655s
sys     0m0.004s

real    0m5.340s
user    0m2.658s
sys     0m0.005s
```

`nproc`で論理CPUの数を確認できるらしいのだが1つだけだった

```
root@64ade9b44ada:/linux-in-practice-2nd/03-process-scheduler# nproc
1
```

Docker > 設定からCPU limitを1→3に変更  
![](/images/zenn/linux-no-shikumi-book/a581f60f5ddd-20261011.png)

起動中にdockerに対して割り当てcpuを増やす

```
docker update --cpus 3 {container_id}
```

これでDockerコンテナのcpuが3に増えた！

```
root@846e54125abe:/linux-in-practice-2nd# nproc
3
```

実行時間も短縮されてる

```
root@846e54125abe:/linux-in-practice-2nd/03-process-scheduler# ./multiload.sh -m 2

real    0m2.604s
user    0m2.556s
sys     0m0.013s

real    0m2.728s
user    0m2.684s
sys     0m0.010s
```

---

Docker コンテナ内の画像の表示をしたい

```
-rw-r--r-- 1 root root 19391 Oct 11 02:13 sched-1.jpg
-rw-r--r-- 1 root root 21509 Oct 11 02:13 sched-2.jpg
-rw-r--r-- 1 root root 22609 Oct 11 02:13 sched-3.jpg
```

VSCodeの拡張機能Dev Containersで手軽にコンテナから取り出してダウンロードできた  
![](/images/zenn/linux-no-shikumi-book/2fce8fb0a1e8-20261011.png)

---

デーモン：常駐プロセス  
スワップ：メモリ領域が枯渇した際に、一時的にストレージデバイスの領域をメモリとして確保する  
スループット：単位時間あたりのデータ転送量  
レイテンシ：1回あたりのI/Oに要する時間  
IOPS：1秒間に処理できるI/Oの数

---

CPU：計算をするチップ全体  
コア：チップにある脳  
物理CPU：チップに物理的に存在するコア  
論理CPU：見かけ上存在するCPU数  
ハイパースレッディング：1つのコアを2つであるかのように働かせる

プロセス：メモリ領域を割り当てられた実行プログラム  
スレッド：プロセス内で命令を実行する単位、1つのプロセスが複数のスレッドを持つ、プロセス内のメモリを共通参照できる、OSが論理CPUに割り当てて実行する

OSとは？CPUとの違いとは？  
OSとはソフトウェア、どの仕事を、いつ、どのCPUにやらせるか管理する

Linuxとは？  
OSのこと、厳密にはカーネルのみを指す

カーネルとは？  
CPUはカーネルモードとユーザモードがあり、カーネルモードだけがデバイスにアクセスできる  
プロセスはカーネルを介して間接的にデバイスにアクセスする  
デバイス制御とシステム上のプロセス管理をするプログラムをカーネルという  
プロセスにCPUリソースの割り当てをする

---

仮想ソフトウェアとは？  
仮想マシン用にカーネルを準備  
mac端末で仮想windowsを動かすことができる

コンテナとは？  
ホストOSのカーネルを使用  
mac端末で仮想windowsを動かすことができない  
カーネルのnamespaceを使っている、namespaceはお互いのプロセスが見れない

どちらの技術でも物理マシンの計算機を使用している

bashとは？

```
docker exec -it {image_id } /bin/bash
```

Dockerに接続する時につけたりするけど何？  
コンテナで/bin/bashを実行する、ということはプログラム

これで表示できた。OSに元から入っているプログラムらしい

```
cat /bin/bash
```

文字化けしている、というか人間が見る想定ではないので、ファイル種別を見る

```
linux-in-practice-2nd % file /bin/bash
/bin/bash: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux-aarch64.so.1, BuildID[sha1]=19c1f2a28c01699ce7b04b4767027253c7316908, for GNU/Linux 3.7.0, stripped
```

これで人間が読める文字だけ抽出してくれた

```
strings /bin/bash | less
```

---

OSとは何かについて、分かりやすく説明されていてとても読みやすかった。特に知識がなくても、読み進められるようになっている。メモリ確保に関する話が多かった。各章の後半に行くにつれて、理解が難しくなっていく。難しいところはペラペラめくりながら目を通すだけ。1週間かけて最後まで読めた。

Linuxとは？について検索しても記事は数多く出てくるが、技術記事が増えすぎた昨今、綺麗に整理されている情報に改めて本の良さを感じた。技術の進歩が早くても、基礎となる考え方は変わらない。Dockerのために勉強したが、並列化やマルチスレッド、マルチプロセスなど、システムの根幹を知っているとイメージがしやすくなる。周辺情報や疑問に思ったことを都度調べながら読むととても楽しい
