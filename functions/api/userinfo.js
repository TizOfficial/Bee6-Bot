export async function onRequest(context) {
  // Query-Parameter auslesen (z. B. /api/userinfo?id=USERID)
  const url = new URL(context.request.url);
  const userId = url.searchParams.get("id");

  if (!userId) {
    return new Response(JSON.stringify({ error: "Bitte ?id=USERID angeben" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        "Authorization": `Bot ${context.env.DISCORD_BOT_TOKEN}`
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Discord API Fehler", status: response.status }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const user = await response.json();

    // Nützliche Daten zurückgeben
    const userData = {
      id: user.id,
      username: user.username,
      global_name: user.global_name || null,
      discriminator: user.discriminator,
      avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null,
      banner: user.banner ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png` : null,
      accent_color: user.accent_color,
      bot: user.bot || false,
      createdAt: new Date(Number(BigInt(user.id) >> 22n) + 1420070400000).toISOString()
    };

    return new Response(JSON.stringify(userData, null, 2), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
  }
