# 签名密钥说明

## 安全策略

为避免密钥泄露，**签名密钥（`*.keystore`）不再入库**。仓库已将 `*.keystore` 加入 `.gitignore`，已在仓库中的密钥文件已移除。

## 构建时获取密钥

构建 Release APK 时需要提供 `zhique-release.keystore`，可通过以下两种方式之一获取：

### 方式一：GitHub Secrets（推荐用于 CI 构建）

1. 在本地生成 keystore（见下方命令）。
2. 将其 base64 编码后存入仓库的 GitHub Secrets，变量名 `ZHIQUE_KEYSTORE`：
   ```bash
   base64 -w 0 zhique-release.keystore > keystore.b64
   # 复制 keystore.b64 内容到 GitHub Secrets：ZHIQUE_KEYSTORE
   ```
3. CI 流程中解码并写入工作目录：
   ```bash
   echo "$ZHIQUE_KEYSTORE" | base64 -d > zhique-release.keystore
   ```
4. 同样需要配置的 Secrets：`ZHIQUE_KEY_ALIAS`（别名，默认 `zhique`）、`ZHIQUE_KEY_PASSWORD`、`ZHIQUE_STORE_PASSWORD`。

### 方式二：本地提供

将 keystore 文件直接放在项目根目录（与 `build-apk.sh` 同级），构建脚本会自动使用。

## 生成签名密钥

首次生成 keystore 命令：

```bash
keytool -genkey -v -keystore zhique-release.keystore -alias zhique -keyalg RSA -keysize 2048 -validity 36500
```

- `alias`：`zhique`
- `keyalg`：`RSA`
- `keysize`：`2048`
- `validity`：`36500`（100 年）

执行后会提示输入 keystore 口令、密钥口令、姓名/组织等信息，按提示填写即可。

> ⚠️ **请妥善保管生成的 keystore 文件和口令**。一旦丢失，将无法对同一应用进行签名升级；一旦泄露，他人可能冒用同一签名发布恶意应用。
