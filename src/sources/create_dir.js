function create_directory(start, directory) {
  const folders = directory.split("/");
  var i = 0;
  var checkedPath = "";
  do {
    checkedPath += `/${folders[i]}`;
    if (!fs.existsSync(`${start}/${checkedPath}`)) {
      // Does not generate a folder if the folder already exists
      fs.mkdirSync(`${start}/${checkedPath}`, function (err, result) {
        if (err) console.log("", err);
      });
    }
    i += 1;
  } while (checkedPath != `/${directory}`);
}
