export default {
  async fetch(request) {

    // ✅ CORS preflight support
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    try {

      const url = new URL(request.url);
      const chat = url.searchParams.get("chat");
      const user = url.searchParams.get("user");

      if (!chat || !user) {
        return jsonResponse({
          ok: false,
          error: "Missing parameters"
        });
      }

      const BOT_TOKEN = "8158661206:AAG5kJCm_pdGlenuSdALkIHhsnZfK0izdQ8"; // 🔥 Put your real bot token here

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=@${chat}&user_id=${user}`
      );

      const data = await telegramResponse.json();

      return jsonResponse(data);

    } catch (error) {

      return jsonResponse({
        ok: false,
        error: "Server error",
        details: error.toString()
      });

    }
  }
};



// ✅ JSON response helper
function jsonResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: corsHeaders()
  });
}


// ✅ CORS headers
function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*"
  };
}
