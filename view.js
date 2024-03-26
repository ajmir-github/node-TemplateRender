const Head = (
  title = "page Name",
  description = "",
  keywords = "",
  author = "Ajmir Raziqi"
) =>
  render("partials/head", {
    title,
    description,
    keywords,
    author,
  });

const Header = (
  websiteName = "Website name",
  currentUrl = "/",
  galleries = []
) =>
  render("partials/header", {
    websiteName: websiteName,
    galleries: renderList("partials/navLink", galleries),
    isActive: (link) => link === currentUrl && "active",
  });

const Footer = (
  websiteName = "websiteName",
  developerName = "Ajmir Raziqi",
  developerProfolioLink = "www.ajmir.com"
) => {
  render("partials/footer", {
    websiteName,
    developerName,
    developerProfolioLink,
  });
};
