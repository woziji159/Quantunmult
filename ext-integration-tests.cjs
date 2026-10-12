// Run with Node.js. Local mock tests; not an iPhone compatibility claim.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const path = require('path'); process.chdir(__dirname);
const results = [];
async function run(file, request, response, stored = {}, fetch) {
  const logs=[]; let calls=0;
  let finish;
  const completed=new Promise(r=>finish=r);
  const context={
    console:{log:(...x)=>logs.push(x.join(' ')),error:(...x)=>logs.push(x.join(' '))},
    $request:Object.assign({method:'GET',headers:{'User-Agent':'QuantumultX test'}},request),
    $response:response, $prefs:{valueForKey:k=>stored[k]??null,setValueForKey:()=>true},
    $task:{fetch:fetch||(()=>Promise.reject(new Error('network disabled in fixture')))},
    $configuration:{sendMessage:async()=>({ret:{'香港':{candidates:['Test node']}}})},
    $script:{startTime:Date.now()/1000}, $done:value=>{calls++;finish(value||{});},
    setTimeout,clearTimeout,URL,TextEncoder,TextDecoder,ArrayBuffer,Uint8Array,
    atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64')
  };
  vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file,timeout:3000});
  let timer;
  const value=await Promise.race([completed,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(file+' did not finish')),9000)})]);
  clearTimeout(timer);
  assert.equal(calls,1,'exactly one final callback');
  return {value,logs};
}
async function test(name,fn) {await fn();results.push(name);console.log('PASS '+name);}
(async()=>{
  const resources=JSON.parse(fs.readFileSync('ext-enabled-resources.json')).enabled;
  const rules=[];
  for(const {file} of resources) {
    for(const rawLine of fs.readFileSync(file,'utf8').split(/\r?\n/)) {
      const line=rawLine.trim();
      if(line.includes(' url-and-header ')) continue;
      if(!line.trim()||line.trim().startsWith('#')||line.startsWith('hostname'))continue;
      const m=line.match(/^(\S+)\s+url\s+(\S+)\s*(.*)$/); assert(m,file+': '+line);
      new RegExp(m[1].replace(/\(\?>/g, '(?:'));
      const dependency=m[3].match(/https:\/\/raw\.githubusercontent\.com\/woziji159\/Quantunmult\/(?:refs\/heads\/)?main\/([^\s]+)/);
      if(dependency)assert(fs.existsSync(dependency[1]),'missing '+dependency[1]);
      rules.push({file,regex:new RegExp(m[1].replace(/\(\?>/g, '(?:')),action:m[2]});
    }
  }
  await test('all active resources have parseable rules and existing local dependencies',async()=>assert(rules.length>100));
  const targetURLs=[
    'https://app.bilibili.com/x/resource/show/tab/v2?test=1',
    'https://grpc.biliapi.net/bilibili.app.viewunite.v1.View/View',
    'https://youtubei.googleapis.com/youtubei/v1/player?key=test',
    'https://youtubei.googleapis.com/youtubei/v1/get_watch?key=test',
    'https://youtubei.googleapis.com/youtubei/v1/browse?subtype=Translate',
    'https://www.google.com/search?q=test',
    'https://www.zhihu.com/question/123/answer/456',
    'https://m.douban.com/movie/subject/123/',
    'https://api.pinduoduo.com/api/alexa/homepage/hub?test=1'
  ];
  for(const url of targetURLs)await test('single response handler: '+url,async()=>{
    const matches=rules.filter(r=>r.action==='script-response-body'&&r.regex.test(url));
    assert.equal(matches.length,1,JSON.stringify(matches.map(r=>r.file)));
  });
  await test('Bili enhanced preserves navigation cleanup',async()=>{
    const input={code:0,data:{bottom:[{id:'home',name:'首页',uri:'bilibili://main/home'},{id:'publish',uri:'bilibili://uper/center_plus'},{id:'mall',name:'会员购',uri:'bilibili://mall/home'},{id:'mine',name:'我的',uri:'bilibili://user_center'}]}};
    const {value,logs}=await run('ext-bili-enhanced-response.bundle.js',{url:targetURLs[0]},{statusCode:200,headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
    const b=JSON.parse(value.body); assert(Array.isArray(b.data.bottom));assert(!b.data.bottom.some(x=>x.id==='publish'||x.id==='mall'||x.name==='会员购'));
    assert(b.data.bottom.length>=2,logs.join('\n'));
  });
  await test('YouTube binary composition finishes on empty protobuf',async()=>{
    const {value}=await run('ext-youtube-combined-response.js',{url:targetURLs[2]},{statusCode:200,headers:{'Content-Type':'application/x-protobuf'},bodyBytes:new ArrayBuffer(0)});
    assert(!value.body || typeof value.body==='string');
  });
  await test('Google successful HTML gets cleanup and pagination together',async()=>{
    const {value}=await run('ext-google-combined-response.js',{url:targetURLs[5]},{statusCode:200,headers:{'Content-Type':'text/html'},body:'<!doctype html><html><head></head><body><div id="center_col"><div id="rso">result</div></div></body></html>'});
    assert(value.body.includes('Endless Google'));assert(value.body.includes('ext-browser-Adblock4limbo.user.js'));
  });
  await test('Google failed retries preserve original challenge',async()=>{
    const {value}=await run('ext-google-combined-response.js',{url:targetURLs[5]},{statusCode:429,headers:{'Content-Type':'text/html'},body:'<html><body>challenge</body></html>'});
    assert(!value.body || value.body==='<html><body>challenge</body></html>');
  });
  await test('PDD removes known promotions and retains core tabs',async()=>{
    const body={result:{search_bar_hot_query:'ad',bottom_tabs:[{link:'index.html'},{link:'promotion.html'},{link:'personal.html'}],dy_module:{irregular_banner_dy:{ad:1},keep:{value:2}}}};
    const {value}=await run('ext-pdd-clean.js',{url:targetURLs[8]},{statusCode:200,headers:{},body:JSON.stringify(body)});
    const out=JSON.parse(value.body);assert.equal(out.result.bottom_tabs.length,2);assert.deepEqual(out.result.dy_module.keep,{value:2});assert(!out.result.search_bar_hot_query);
  });
  await test('PDD malformed response passes through',async()=>{
    const {value}=await run('ext-pdd-clean.js',{url:targetURLs[8]},{body:'not JSON'});assert(!Object.keys(value).length);
  });
  await test('Zhihu injects once, ignores JSON API responses',async()=>{
    const {value}=await run('ext-zhihu-helper.js',{url:targetURLs[6]},{body:'<html><head></head><body>正文</body></html>',headers:{'content-security-policy':"script-src 'none'"}});
    assert(value.body.includes('quantunmult-zhihu-helper'));assert(!value.headers['content-security-policy']);
    const again=await run('ext-zhihu-helper.js',{url:targetURLs[6]},{body:value.body,headers:{}});assert(!again.value.body);
    const json=await run('ext-zhihu-helper.js',{url:targetURLs[6]},{body:'{"x":1}',headers:{}});assert(!json.value.body);
  });
  fs.writeFileSync('ext-integration-validation.json',JSON.stringify({date:'2026-10-12',tests:results.length,passed:results,activeRules:rules.length,deviceTested:false},null,2)+'\n');
})().catch(e=>{console.error(e);process.exitCode=1});
