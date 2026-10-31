// The Work preview runner uses Vite-style flags; translate them for Next.js.
import {spawn} from 'node:child_process';
const args=process.argv.slice(2).flatMap(x=>x==='--strictPort'?[]:x==='--host'?['--hostname']:[x]);
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev',...args],{stdio:'inherit',env:{...process.env,Q7_NEXT_DIST_DIR:'.next-dev'}});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
