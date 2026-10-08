#!/bin/zsh

# Standalone helper: zshrc exposes wiki-start and wiki-stop without changing cwd.
emulate -L zsh
setopt NO_NOMATCH

readonly wiki_dir="${0:A:h:h}"
readonly wiki_url='http://127.0.0.1:4173/'
readonly wiki_log="$wiki_dir/.vitepress/wiki-dev.log"

wiki_listener_pid() {
  /usr/sbin/lsof -nP -tiTCP:4173 -sTCP:LISTEN 2>/dev/null
}

wiki_owns_process() {
  local wiki_pid="$1"
  [[ "$wiki_pid" == <-> ]] || return 1
  local wiki_cwd="$(/usr/sbin/lsof -a -p "$wiki_pid" -d cwd -Fn 2>/dev/null | /usr/bin/sed -n 's/^n//p')"
  local wiki_command="$(/bin/ps -p "$wiki_pid" -o command= 2>/dev/null)"
  [[ "$wiki_cwd" == "$wiki_dir" && "$wiki_command" == *vitepress* ]]
}

wiki_start_service() {
  local wiki_pid="$(wiki_listener_pid)"
  if [[ -n "$wiki_pid" ]]; then
    if wiki_owns_process "$wiki_pid"; then
      print -r -- "WIKI 已在运行：$wiki_url"
      return 0
    fi
    print -u2 -r -- '端口 4173 被其他服务占用，WIKI 未启动。'
    return 1
  fi

  local wiki_node='/opt/homebrew/bin/node'
  local wiki_cli="$wiki_dir/node_modules/vitepress/bin/vitepress.js"
  if [[ ! -x "$wiki_node" || ! -f "$wiki_cli" ]]; then
    print -u2 -r -- "缺少 Node.js 或 VitePress 依赖，请检查项目：$wiki_dir"
    return 1
  fi

  (
    cd -- "$wiki_dir" || exit 1
    # Start a separate session so closing the launching terminal cannot stop it.
    exec /usr/bin/nohup /usr/bin/perl -MPOSIX -e '
      defined(POSIX::setsid()) or die "Cannot detach WIKI: $!";
      exec @ARGV or die "Cannot start WIKI: $!";
    ' "$wiki_node" "$wiki_cli" dev \
      --host 127.0.0.1 --port 4173 --strictPort \
      >"$wiki_log" 2>&1 </dev/null
  ) &!
  local wiki_started_pid=$!
  local wiki_attempt
  for wiki_attempt in {1..50}; do
    if [[ "$(wiki_listener_pid)" == "$wiki_started_pid" ]] &&
      /usr/bin/curl --noproxy '*' --silent --fail --max-time 1 --output /dev/null "$wiki_url"; then
      print -r -- "WIKI 已启动：$wiki_url"
      return 0
    fi
    if ! kill -0 "$wiki_started_pid" 2>/dev/null; then
      print -u2 -r -- "WIKI 启动失败，日志：$wiki_log"
      return 1
    fi
    /bin/sleep 0.2
  done
  print -u2 -r -- "WIKI 尚未就绪，请查看日志：$wiki_log"
  return 1
}

wiki_stop_service() {
  local wiki_pid="$(wiki_listener_pid)"
  if [[ -z "$wiki_pid" ]]; then
    print -r -- 'WIKI 没有在运行。'
    return 0
  fi
  if ! wiki_owns_process "$wiki_pid"; then
    print -u2 -r -- '端口 4173 上运行的是其他服务，未停止。'
    return 1
  fi
  kill -TERM "$wiki_pid" || return 1
  local wiki_attempt
  for wiki_attempt in {1..50}; do
    if [[ "$(wiki_listener_pid)" != "$wiki_pid" ]]; then
      print -r -- 'WIKI 已停止。'
      return 0
    fi
    /bin/sleep 0.1
  done
  print -u2 -r -- 'WIKI 仍在退出，请稍后重试。'
  return 1
}

case "$1" in
  start) wiki_start_service ;;
  stop) wiki_stop_service ;;
  *) print -u2 -r -- '用法：wiki-start 或 wiki-stop'; exit 1 ;;
esac
