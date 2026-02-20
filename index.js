export default {
  async fetch(request) {

    const url = new URL(request.url);

    const chat = url.searchParams.get("chat");
    const user = url.searchParams.get("user");

    if (!chat || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing parameters" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const BOT_TOKEN = "8158661206:AAG5kJCm_pdGlenuSdALkIHhsnZfK0izdQ8";

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=@${chat}&user_id=${user}`
    );

    const data = await telegramResponse.text();

    return new Response(data, {
      headers: { "Content-Type": "application/json" }
    });
  }
};
