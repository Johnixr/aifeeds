#!/bin/bash

# 配置变量
LOCAL_PATH="/Users/yinxj/workspace/ai_feeds_gitee/.output/public"
REMOTE_HOST="root@47.251.50.231"
REMOTE_PATH="/root/workspace/online/agihunt_fe"

# 开始时间（使用毫秒级精度）
start_time=$(date +%s.%N)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始部署..."

# 构建
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 执行构建..."
pnpm build || exit 1

# 压缩（完全禁用 macOS 元数据）
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 创建压缩包..."
cd $LOCAL_PATH && \
COPYFILE_DISABLE=1 tar --no-xattrs --no-mac-metadata -czf /tmp/dist.tar.gz . 2>/dev/null || exit 1

# 传输文件
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 传输文件..."
scp /tmp/dist.tar.gz $REMOTE_HOST:$REMOTE_PATH/ || exit 1

# 远程操作
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 远程操作 - 解压新文件..."
ssh $REMOTE_HOST "cd $REMOTE_PATH && \
  if [ ! -f dist.tar.gz ]; then echo '错误：dist.tar.gz 文件不存在！'; exit 1; fi && \
  find . -mindepth 1 -not -name 'dist.tar.gz' -delete && \
  tar -xzf dist.tar.gz && \
  rm dist.tar.gz" || exit 1

# 清理本地临时文件
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 清理本地临时文件..."
rm /tmp/dist.tar.gz

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 部署完成!"

# 计算耗时（使用毫秒级精度）
end_time=$(date +%s.%N)
duration=$(echo "$end_time - $start_time" | bc)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 总耗时: $(printf "%.2f" $duration) 秒"