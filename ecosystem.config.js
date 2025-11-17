module.exports = {
  apps: [{
    name: "msgxone",
    script: "./server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    max_memory_restart: "1G",
    watch: false,
    time: true
  }]
};
