const express = require("express");
const bodyParser = require("body-parser");
const server = express();
const cors = require("cors");
const puppeteer = require("puppeteer");

// App config
server.use(cors());
server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

server.get("*", (req, res) => res.send("Hello!"));

var port = process.env.PORT || 4000;

server.post("/get-words", async (req, res) => {
  const wordToSearch = req.body.theme;
  console.log(req.body);
  let responseWords = [];
  await puppeteer
    .launch({ headless: true, args: ["--no-sandbox"] })
    .then(async (browser) => {
      const page = await browser.newPage();
      await page.goto("https://smallworldofwords.org/en/project/explore");

      // for console logging
      page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

      // Wait for search box to appear
      await page.waitForSelector("#searchBox");

      // Type into search box and press enter
      await page.type("#searchBox", wordToSearch);
      await page.keyboard.press("Enter");

      // Waits for response to load

      // Get associated words
      let words = await page.evaluate(async () => {
        const delay = (time) => {
          return new Promise(function (resolve) {
            setTimeout(resolve, time);
          });
        };
        await delay(200);
        let words = [];
        let responses = document.getElementsByClassName("response");
        for (let response of responses) {
          words.push(response.innerText);
        }
        console.log(words);

        return words;
      });

      console.log("words", words);
      responseWords = responseWords.concat(words);

      await browser.close();
    });

  console.log(responseWords);

  res.json({ words: responseWords });
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
