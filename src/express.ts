import "dotenv/config";
import statsCard from "./api/index";
import repoCard from "./api/pin";
import langCard from "./api/top-langs";
import wakatimeCard from "./api/wakatime";
import snippetsCard from "./api/snippets";
import express from "express";

const app = express();
const router = express.Router();

router.get("/", statsCard);
router.get("/pin", repoCard);
router.get("/top-langs", langCard);
router.get("/wakatime", wakatimeCard);
router.get("/snippets", snippetsCard);

app.use("/api", router);

const port = Number(process.env.PORT || process.env.port) || 9000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
