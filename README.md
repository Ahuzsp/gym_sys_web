# gym_web

健身房管理前端项目（基于当前页面：登录、会员、员工、排班/预约、菜单管理等），使用 Vue 3 + Vite 构建。

**技术栈**
- Vue 3
- Vite
- Vue Router
- Pinia
- Ant Design Vue
- Axios
- Day.js

**目录结构**
```
public/                  静态资源
src/
  api/                   接口模块（如：member、staff、schedule 等）
  assets/                静态资源
  layouts/               布局（MainLayout）
  router/                路由配置
  stores/                Pinia 状态管理
  utils/                 工具封装（request、permission 等）
  views/                 页面视图
    schedule/            排班/预约相关页面与组件
    system/              系统配置相关页面
  App.vue
  main.js
index.html
vite.config.js
```

**环境要求**
- Node.js `^20.19.0` 或 `>=22.12.0`

**快速开始**
```sh
npm install
```

**常用命令**
```sh
npm run dev      # 本地开发
npm run build    # 生产构建
npm run preview  # 预览构建产物
```
