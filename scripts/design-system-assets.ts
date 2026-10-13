// Copies the design system's logos and icons into public/assets/ before
// every dev and build run. Logo, NavigationBar and SocialLink load them
// from /assets/ (we pass base="/"), and the package ships them since
// 1.3.0, so the copies are not committed and always match the installed
// version.

import { cpSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const source = join(dirname(require.resolve("tedx-amsterdam-design-system/package.json")), "assets");
const target = join("public", "assets");

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
