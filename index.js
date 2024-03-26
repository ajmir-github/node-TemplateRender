const express = require("express");
const path = require("path");
const { render, renderList } = require("./libs/TemplateRender");

const app = express();
const port = 3000;

// View engine setup <!--- here --->
app.use(express.urlencoded({ extended: false }));
app.use("/", express.static(path.join(__dirname, "public")));

const galleries = [
  { id: "1", name: "Nature", count: 10 },
  { id: "2", name: "People", count: 20 },
  { id: "3", name: "Architecture", count: 1 },
  { id: "4", name: "Animals", count: 40 },
  { id: "5", name: "Sports", count: 10 },
];

// // pages
app.get("/", async function (req, res) {
  const html = await render("index", {
    Head: {
      title: "new title",
      description: "new description",
      keywords: "new keywords",
      author: "new author",
    },
    header: {
      websiteName: "blabla.com",
      galleries: galleries.map((gallery) =>
        render("partials/navLink", gallery)
      ),
      isActive: (link) => link === "/" && "active",
    },
    hero: {
      name: "Ajmir Raziqi",
      city: "Kabul, Afghanistan",
      bio: "Blanditiis praesentium aliquam illum tempore incidunt debitis dolorem magni est deserunt sed qui libero. Qui voluptas amet.",
    },
    footer: {
      websiteName: "blabla.com",
      developerName: "Ajmir Raziqi",
      developerProfolioLink: "www.ajmir.com",
    },
  });
  res.send(html);
});

// about page
app.get("/about", function (req, res) {
  res.send(
    render("about", {
      Head: Head(),
      Header: Header(),
      Footer: Footer(),
    })
  );
});

// activate
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
