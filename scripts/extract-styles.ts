// @ts-expect-error styles is patched
import { styles } from "react-activity-calendar";
import { writeFile } from "node:fs/promises";

writeFile("src/react-activity-calendar.css", styles, "utf-8");
