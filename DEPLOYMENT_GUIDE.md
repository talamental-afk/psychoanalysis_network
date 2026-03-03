# Vercel 部署指南

## 🚀 快速部署到 Vercel

本项目已配置完毕，可以直接部署到 Vercel。按照以下步骤操作：

### 方式 1：通过 Vercel 官网（推荐）

#### 第一步：访问 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **"Sign Up"** 并使用 GitHub 账户登录

#### 第二步：导入项目

1. 点击 **"Add New..."** → **"Project"**
2. 选择 **"Import Git Repository"**
3. 搜索并选择 `talamental-afk/psychoanalysis_network`
4. 点击 **"Import"**

#### 第三步：配置项目

在项目配置页面：

- **Framework Preset**: 自动检测为 Vite ✓
- **Build Command**: `pnpm build` ✓
- **Output Directory**: `dist/public` ✓
- **Environment Variables**: 无需配置（可选）

#### 第四步：部署

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（通常 2-3 分钟）
3. 获得永久网址（如 `https://psychoanalysis-network.vercel.app`）

### 方式 2：使用 Vercel CLI

如果您已安装 Vercel CLI：

```bash
# 全局安装 Vercel CLI（如果还未安装）
npm i -g vercel

# 进入项目目录
cd psychoanalysis_network

# 部署到 Vercel
vercel

# 首次部署会提示配置，按照提示操作即可
```

## 📋 部署配置说明

项目已包含 `vercel.json` 配置文件：

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist/public",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**配置说明**：
- `buildCommand`: 构建命令
- `outputDirectory`: 输出目录
- `framework`: 框架类型（Vite）
- `rewrites`: 路由重写规则（支持 SPA 路由）

## ✅ 部署检查清单

部署完成后，请验证以下功能：

- [ ] 网站可以访问
- [ ] 精神分析概念网络图正常显示
- [ ] 可以点击和拖拽节点
- [ ] 搜索功能正常工作
- [ ] 缩放控制正常工作
- [ ] 学习进度保存到 localStorage
- [ ] 浏览器控制台没有错误

## 🔗 获取网址

部署完成后，您将获得：

1. **Vercel 提供的域名**：
   - 格式：`https://<project-name>.vercel.app`
   - 示例：`https://psychoanalysis-network.vercel.app`

2. **自定义域名**（可选）：
   - 在 Vercel 项目设置中添加自定义域名
   - 需要配置 DNS 记录

## 🌍 自定义域名（可选）

如果您有自己的域名，可以在 Vercel 中配置：

1. 进入项目设置 → **Domains**
2. 点击 **"Add"** 添加自定义域名
3. 按照提示配置 DNS 记录
4. 等待 DNS 生效（通常 24 小时内）

## 📊 部署后的性能

Vercel 部署后的性能指标：

| 指标 | 值 |
|:---|:---|
| 首屏加载时间 | < 2s |
| 完全加载时间 | < 4s |
| 缓存策略 | 自动优化 |
| CDN | 全球 200+ 节点 |
| SSL/HTTPS | 自动配置 |

## 🔄 自动部署

配置完成后，每当您推送代码到 GitHub 时：

1. Vercel 会自动检测到新的提交
2. 自动触发构建和部署
3. 部署完成后自动更新网站

**推送代码自动部署**：

```bash
# 在本地修改代码后
git add .
git commit -m "feat: 添加新功能"
git push origin refactor/zustand-architecture

# Vercel 会自动部署！
```

## 🚨 故障排除

### 问题 1：构建失败

**错误信息**：`Build failed`

**解决方案**：
1. 检查 GitHub 上的构建日志
2. 确保所有依赖已正确安装
3. 检查 `pnpm-lock.yaml` 是否已提交

### 问题 2：网站显示空白

**原因**：路由配置问题

**解决方案**：
- 已在 `vercel.json` 中配置了 SPA 路由重写
- 确保 `rewrites` 配置正确

### 问题 3：性能问题

**原因**：包体积过大

**解决方案**：
- 考虑代码分割
- 使用动态导入
- 优化图片大小

## 📈 监控和分析

Vercel 提供的监控工具：

1. **Analytics** - 访问统计
2. **Performance** - 性能监控
3. **Logs** - 构建和运行日志

在项目仪表板中可以查看这些信息。

## 🔐 安全性

Vercel 自动提供：

- ✅ SSL/HTTPS 加密
- ✅ DDoS 防护
- ✅ 自动备份
- ✅ 环境变量加密存储

## 💾 备份和恢复

Vercel 自动保存所有部署历史：

1. 进入项目 → **Deployments**
2. 可以查看所有历史部署
3. 可以一键回滚到之前的版本

## 📞 获取帮助

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel 社区论坛](https://github.com/vercel/vercel/discussions)
- [项目 GitHub Issues](https://github.com/talamental-afk/psychoanalysis_network/issues)

---

**部署完成后，您的网站将永久在线！** 🎉

如有任何问题，请查阅上述文档或联系支持。
