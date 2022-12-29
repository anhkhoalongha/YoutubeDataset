function YoutubeScraper() {
  var keyword = [
    "xe đẹp", //1
    "xe độ", //2
    "phương tiện di chuyển", //3
    "phương tiện trên không", //4
    "phương tiện di chuyển độc đáo",//5
    "siêu xe", //6
    "xe khủng",//7
    "xe đua",//8
    "review xe",//9
    "xe cộ",//10,
    "phương tiện giao thông công cộng"//11
    ];
  i=0;
  while(i<11){
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
  var activeSheet = spreadSheet.getActiveSheet();
  var numberOfData = 150; // When 0 is set, all values are retrieved.

  // Retrieve YouTube.Search.list.
  var data = [];
  var pageToken = "";
  do {
    var search = YouTube.Search.list("snippet", { q: keyword[i], maxResults: 50, pageToken: pageToken });
    data = data.concat(search.items);
    pageToken = search.nextPageToken;
    if (numberOfData != 0 && data.length > numberOfData) break;
  } while (pageToken);
  if (numberOfData != 0) data = data.splice(0, numberOfData);

  var results = data.map((item) => [item.snippet.channelId, item.id.videoId, item.snippet.title, item.snippet.description,]);

  // Retrieve channel IDs and video IDs.
  var { channelIds, videoIds } = results.reduce((o, [channelId, videoId]) => {
    o.channelIds.push(channelId);
    o.videoIds.push(videoId);
    return o;
  }, { channelIds: [], videoIds: [] });

  // Retrieve YouTube.Videos.list.
  var videoList = [];
  while (videoIds.length > 0) {
    var temp = YouTube.Videos.list("statistics, contentDetails", { id: videoIds.splice(0, 50).join(",") });
    videoList = videoList.concat(temp.items);
  }
  var videoStats = videoList.map((item) => [item.id, item.statistics.viewCount, item.statistics.likeCount, item.contentDetails.duration]).reduce((o, [id, ...v]) => Object.assign(o, { [id]: v }), {});

  // Retrieve YouTube.Channels.list
  var channelList = [];
  while (channelIds.length > 0) {
    var temp = YouTube.Channels.list("statistics", { id: channelIds.splice(0, 50).join(",") });
    channelList = channelList.concat(temp.items);
  }
  var channelStats = channelList.map((item) => [item.id, item.statistics.viewCount, item.statistics.subscriberCount]).reduce((o, [id, ...v]) => Object.assign(o, { [id]: v }), {});

  // Create an array for putting values and put the values to Spreadsheet.
  results = results.map(e => channelStats[e[0]] ? e.concat(channelStats[e[0]]) : e.concat(Array(2).fill("")));
  results = results.map(e => videoStats[e[1]] ? e.concat(videoStats[e[1]]) : e.concat(Array(3).fill("")));
  var header = ["channelId", "videoId", "title", "Description", "viewCount", "subscriberCount", "viewCount", "likeCount", "Duration"];
  if (i==0) {
     results.unshift(header);
   }
  
  activeSheet.getRange(numberOfData*i+1, 1, results.length, results[0].length).setValues(results);
  i=i+1;
  }
}
