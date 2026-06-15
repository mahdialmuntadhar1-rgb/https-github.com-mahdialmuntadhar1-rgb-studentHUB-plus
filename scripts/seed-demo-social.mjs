const API = process.env.API || "https://rafid-api.mahdialmuntadhar1.workers.dev";
const PASSWORD = process.env.DEMO_PASSWORD || "Demo12345!";
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

const demoUsers = [
  {
    name: "Sara Mahmood",
    emailPrefix: "sara.mahmood",
    governorate: "sulaymaniyah",
    university: "University of Sulaymaniyah",
    posts: [
      "Anyone knows a quiet place near campus to study after 5 PM? I need somewhere calm with good internet.",
      "Good morning everyone. Small reminder: if you have exam notes, please share them with your classmates. It really helps."
    ]
  },
  {
    name: "Hama Karim",
    emailPrefix: "hama.karim",
    governorate: "sulaymaniyah",
    university: "University of Sulaimani",
    posts: [
      "Who is going to the career fair this week? I am thinking we can go as a small group.",
      "Looking for students interested in volunteering for a campus cleanup day. Nothing official yet, just checking interest."
    ]
  },
  {
    name: "Lana Ahmed",
    emailPrefix: "lana.ahmed",
    governorate: "erbil",
    university: "Salahaddin University",
    posts: [
      "I am looking for two classmates to join a graduation project team. Prefer people who are serious and can meet weekly.",
      "Does anyone know a good place in Erbil for printing project reports with clean binding?"
    ]
  },
  {
    name: "Diyar Hassan",
    emailPrefix: "diyar.hassan",
    governorate: "duhok",
    university: "University of Duhok",
    posts: [
      "Best cafe near university for laptop work? I need a place with electricity and not too much noise.",
      "If anyone has beginner web development resources, please share. I want to start learning during the holiday."
    ]
  },
  {
    name: "Rojin Ali",
    emailPrefix: "rojin.ali",
    governorate: "sulaymaniyah",
    university: "Komar University",
    posts: [
      "Any law students here? I need notes about administrative law and public law if someone can help.",
      "Small idea: we should have a weekly student discussion post for internships, scholarships, and events."
    ]
  },
  {
    name: "Omar Saeed",
    emailPrefix: "omar.saeed",
    governorate: "baghdad",
    university: "University of Baghdad",
    posts: [
      "Sharing this here: students should check university pages every week because many opportunities are missed quietly.",
      "What is one skill you think every university student should learn before graduation?"
    ]
  },
  {
    name: "Zana Qadir",
    emailPrefix: "zana.qadir",
    governorate: "erbil",
    university: "Tishk International University",
    posts: [
      "Anyone interested in a student startup group? We can meet online first and discuss simple app ideas.",
      "I like the idea of this app because university posts, requests, and opportunities can be in one place."
    ]
  },
  {
    name: "Narin Mohammed",
    emailPrefix: "narin.mohammed",
    governorate: "halabja",
    university: "University of Halabja",
    posts: [
      "For students from Halabja: please share any local training or volunteer opportunities you know about.",
      "Sometimes the best help is just one student telling another student where to start. Let us make this feed useful."
    ]
  }
];

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const message = data?.error || response.statusText || "Request failed";
    throw new Error(`${response.status} ${message}`);
  }
  return data;
}

async function main() {
  console.log(`API: ${API}`);
  console.log(`Demo password for all users: ${PASSWORD}`);
  console.log(`Stamp: ${stamp}`);

  const created = [];

  for (const demo of demoUsers) {
    const email = `${demo.emailPrefix}.${stamp}@jamiaati.test`;

    try {
      const register = await request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: demo.name,
          full_name: demo.name,
          email,
          password: PASSWORD,
          governorate: demo.governorate,
          governorateId: demo.governorate,
          university: demo.university,
          institution: demo.university
        })
      });

      const token = register.token;
      if (!token) throw new Error("Register did not return token");

      for (const content of demo.posts) {
        const title = content.length > 70 ? content.slice(0, 70) : content;
        const post = await request("/api/posts", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title,
            content,
            visibility: "public",
            governorateId: demo.governorate,
            governorate: demo.governorate,
            university: demo.university,
            universityId: demo.university,
            institution: demo.university
          })
        });

        created.push({
          name: demo.name,
          email,
          postId: post?.post?.id || "unknown",
          title
        });
      }

      console.log(`Created ${demo.name} <${email}> with ${demo.posts.length} posts`);
    } catch (error) {
      console.error(`FAILED for ${demo.name}: ${error.message}`);
    }
  }

  console.log("\nCreated demo records:");
  console.table(created);

  const feed = await request("/api/feed?limit=20");
  const posts = feed.posts || feed.feed || [];
  console.log("\nLatest feed:");
  console.table(posts.slice(0, 20).map((post) => ({
    id: post.id,
    author: post.authorName || post.author?.name || post.author_name || "unknown",
    title: post.title,
    createdAt: post.createdAt || post.created_at
  })));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
