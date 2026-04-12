import "dotenv/config";
import statsCard from "./src/api/index";
import repoCard from "./src/api/pin";
import langCard from "./src/api/top-langs";
import wakatimeCard from "./src/api/wakatime";
import gistCard from "./src/api/gist";
import express from "express";

const app = express();
const router = express.Router();

router.get("/", statsCard);
router.get("/pin", repoCard);
router.get("/top-langs", langCard);
router.get("/wakatime", wakatimeCard);
router.get("/gist", gistCard);

app.use("/api", router);

const port = Number(process.env.PORT || process.env.port) || 9000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
