const PROXY_CONFIG = [
  {
    context: [
      "/ddapi"
    ],
    target: "https://localhost:7018",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
