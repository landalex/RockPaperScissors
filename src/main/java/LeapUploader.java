import com.leapmotion.leap.Bone;
import com.leapmotion.leap.Controller;
import com.leapmotion.leap.Finger;
import com.leapmotion.leap.FingerList;
import com.leapmotion.leap.Frame;
import com.leapmotion.leap.Hand;
import com.leapmotion.leap.HandList;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class LeapUploader {
    public static final String url = "http://localhost:80/";

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

    public static void main(String[] args) throws InterruptedException {
        Controller controller = new Controller();
        while (!controller.isConnected()) {
            Thread.sleep(1000);
        }

        System.out.println("ROCK");
        Thread.sleep(500);
        System.out.println("PAPER");
        Thread.sleep(500);
        System.out.println("SCISSORS (THROW!)");
        Thread.sleep(100);

        List<Move> frames = new ArrayList<>(1000);
        while (frames.size() < 5000) {
            Frame frame = controller.frame();
            if (!frame.hands().isEmpty()) {
                boolean rock = detectRock(frame);
                boolean paper = detectPaper(frame);
                boolean scissors = detectScissors(frame);
                if (!(rock ^ paper ^ scissors)) {
                    frames.add(Move.INVALID);
                }
                else {
                    if (rock) {
                        frames.add(Move.ROCK);
                    }
                    else if (paper) {
                        frames.add(Move.PAPER);
                    }
                    if (scissors) {
                        frames.add(Move.SCISSORS);
                    }
                }
            }
        }

        Move bestMove = findMode(frames);
        System.out.println("Detected move: " + bestMove);
        System.out.println(String.format("{\"move\": \"%s\"}", bestMove.toString()));
        sendMove(bestMove);
    }

    private static String sendMove(Move bestMove) {
        MediaType JSON
                = MediaType.parse("application/json; charset=utf-8");

        OkHttpClient client = new OkHttpClient();

        try {
            RequestBody body = RequestBody.create(JSON, String.format("{\"move\": \"%s\"}", bestMove.toString()));
            Request request = new Request.Builder()
                    .url(url)
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

    private static Move findMode(List<Move> frames) {
        HashMap<Move, Integer> moveMap = new HashMap<>();
        for (Move move: frames) {
            Integer count = moveMap.get(move);
            if (count == null) {
                count = 0;
            }
            count++;
            moveMap.put(move, count);
        }
        Move mode = null;
        for (Move move: moveMap.keySet()) {
            if (mode == null) {
                mode = move;
            }
            else if (moveMap.get(mode) < moveMap.get(move)){
                mode = move;
            }
        }

        System.out.println(moveMap.keySet().size());
        for (Move move: moveMap.keySet()) {
            System.out.println(move + ": " + moveMap.get(move));
        }
        return mode;
    }

    private static boolean detectScissors(Frame frame) {
        FingerList fingerList = frame.fingers().extended();
        return fingerList.count() == 2 &&
                fingerList.fingerType(Finger.Type.TYPE_INDEX).count() == 1 &&
                fingerList.fingerType(Finger.Type.TYPE_MIDDLE).count() == 1;
    }

    private static boolean detectPaper(Frame frame) {
        FingerList fingerList = frame.fingers().extended();
        // Detect paper with thumb extended or not
        return fingerList.count() >= 4;
    }

    private static boolean detectRock(Frame frame) {
        FingerList fingerList = frame.fingers().extended();
        return fingerList.count() == 0 || (fingerList.count() == 1 && fingerList.get(0).type() == Finger.Type.TYPE_THUMB);
    }

}
