
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;

public class LeapClient {
    public static String name = "alex";

    enum Move {
        ROCK("rock"),
        PAPER("paper"),
        SCISSORS("scissors"),
        INVALID("invalid");

        private final String text;

        Move(final String text) {
            this.text = text;
        }

        @Override
        public String toString() {
            return text;
        }
    }

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        System.out.print("How would you like to play? (1 for Leap, 2 for keyboard) ");
        String s = br.readLine();
        GameController controller = null;
        if (Integer.parseInt(s) == 1) {
            controller = new LeapController();
        }
        else {
            controller = new KeyboardController();
        }

        System.out.println();
        System.out.print("What's your name? ");
        name = br.readLine();

        while (true) {
            joinQueue(name);

            System.out.println("ROCK");
            Thread.sleep(500);
            System.out.println("PAPER");
            Thread.sleep(500);
            System.out.println("SCISSORS (THROW!)");
            Thread.sleep(100);

            Move bestMove = controller.getMove();
            System.out.println("Detected move: " + bestMove);
            System.out.println(String.format("{\"name\": \"%s\", \"move\": \"%s\"}", name, bestMove.toString()));
            String matchId = makeMove(name, bestMove).replace("\"", "");
            System.out.println("MatchId: " + matchId);
            subToResult(name, matchId, new JedisPubSub() {
                @Override
                public void onMessage(String channel, String message) {
                    super.onMessage(channel, message);
                    System.out.println("Results: " + message);
                    super.unsubscribe();
                }

                @Override
                public void onSubscribe(String channel, int subscribedChannels) {
                    super.onSubscribe(channel, subscribedChannels);
                    System.out.println("Subscribed to " + channel + " at " + System.currentTimeMillis());

                }

                @Override
                public void onUnsubscribe(String channel, int subscribedChannels) {
                    super.onUnsubscribe(channel, subscribedChannels);
                    System.out.println("Unsubscribed from " + channel);
                }
            });

            br.readLine();
        }
    }

    private static String joinQueue(String name) {
        MediaType JSON
                = MediaType.parse("application/json; charset=utf-8");

        OkHttpClient client = new OkHttpClient();

        try {
            RequestBody body = RequestBody.create(JSON, String.format("{\"name\": \"%s\"}", name));
            Request request = new Request.Builder()
                    .url("https://gordonshieh94.lib.id/stdlib-funcs@prod/join_queue/")
                    .post(body)
                    .build();
            Response response = client.newCall(request).execute();
            if (response.body() != null) {
                return response.body().string();
            }
        }
        catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    private static String makeMove(String name, Move bestMove) {
        MediaType JSON
                = MediaType.parse("application/json; charset=utf-8");

        OkHttpClient client = new OkHttpClient();

        try {
            RequestBody body = RequestBody.create(JSON, String.format("{\"name\": \"%s\", \"move\": \"%s\"}", name, bestMove.toString()));
            Request request = new Request.Builder()
                    .url("https://gordonshieh94.lib.id/stdlib-funcs@prod/make_move/")
                    .post(body)
                    .build();
            Response response = client.newCall(request).execute();
            if (response.body() != null) {
                return response.body().string();
            }
        }
        catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    private static void subToResult(final String name, final String matchId, final JedisPubSub callback) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                Jedis jedis = new Jedis("34.211.214.70", 6379, 300);
                jedis.subscribe(callback, name + "_" + matchId + "_channel");
            }
        }).start();

    }

}
