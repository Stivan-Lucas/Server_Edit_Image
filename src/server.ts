// src/server.ts
import { app } from "./app.ts";
import { allTexts } from "./constants/all-texts.ts";

app.listen({ port: 8080, host: "127.0.0.1" }, (err, address) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}

	app.log.info(allTexts.server.documentation.replace("{address}", address));
});
