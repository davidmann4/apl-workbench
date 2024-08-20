import chokidar from "chokidar"
import exec from 'child_process'
import path from "path"
import ctp from "console-table-printer"
import fs from "fs"

const watcher = chokidar.watch('input/')
var dataset = {}

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function get_dps_for(id){
  const data= fs.readFileSync('output/'+id+'.json');
  return Math.floor(JSON.parse(data).sim.players[0].collected_data.dps.median /1000) +"k";
}

function updateTable(){
  process.stdout.write('\x1Bc')//cls
  const table = new ctp.Table();

  for (let key in dataset) {
    table.addRow(dataset[key])
  }

  table.printTable();
}

watcher.on('change', (file, file_stats) => {

  const file_infos = path.parse(file)
  console.log(file, "changed", file_stats);

  const id = makeid(6)

  dataset[id] = {
    id: id,
    name: file_infos.name,
    ctime: file_stats.ctimeMs,
    dps: 0,
    report: "output/"+id+".html"
  }
  updateTable()

  const child = exec.spawn('simc', [file,"output=output/output_tmp_.txt","html=output/"+id+".html","json=output/"+id+".json"]);
  child.stdout.setEncoding('utf8');
  // use child.stdout.setEncoding('utf8'); if you want text chunks
  child.stdout.on('data', (chunk) => {
    // console.log(chunk)
    if(chunk.startsWith("Generating Baseline:")){
      const progress = chunk.split("=").length
      dataset[id].dps = ((progress / 20) * 100) + "%"

      updateTable()
    }
    // data from standard output is here as buffers
  });

  // since these are streams, you can pipe them elsewhere

  child.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    
    dataset[id].dps = get_dps_for(id)
    updateTable()
  });
});