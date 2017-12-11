function Start-ElasticSeach(){
   $processname="elasticsearch"
   if((get-process $processName -ErrorAction SilentlyContinue) -eq $Null)
    {
         echo "Process is not running" 
         echo "starting elastic search server..."
         Start-Process -FilePath 'C:\Program Files\Elastic\Elasticsearch\bin\elasticsearch.exe'

    }

    else{ echo "Process is already running" }

}
 Start-ElasticSeach
 
Start-Sleep -Seconds 15
#start Kibana
start-Process 'C:\Program Files\Elastic\kibana-5.5.0-windows-x86\bin\kibana.bat'
#start node search API
Start-Sleep -Seconds 7
cd "C:\Users\aleja\OneDrive\GitHUb\open-api-nodejs"
npm start
Start-Sleep -Seconds 7
#start search web app
#cd "C:\Users\aleja\OneDrive\GitHUb\recalls-search-vuejs"
npm start