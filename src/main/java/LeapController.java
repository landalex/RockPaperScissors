import com.leapmotion.leap.Controller;
import com.leapmotion.leap.Finger;
import com.leapmotion.leap.FingerList;
import com.leapmotion.leap.Frame;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class LeapController implements GameController {
    @Override
    public LeapClient.Move getMove() {
        Controller controller = new Controller();
//        while (!controller.isConnected()) {
//            Thread.sleep(1000);
//        }

        List<LeapClient.Move> frames = new ArrayList<>(1000);
        while (frames.size() < 5000) {
            Frame frame = controller.frame();
            if (!frame.hands().isEmpty()) {
                boolean rock = detectRock(frame);
                boolean paper = detectPaper(frame);
                boolean scissors = detectScissors(frame);
                if (!(rock ^ paper ^ scissors)) {
                    frames.add(LeapClient.Move.INVALID);
                }
                else {
                    if (rock) {
                        frames.add(LeapClient.Move.ROCK);
                    }
                    else if (paper) {
                        frames.add(LeapClient.Move.PAPER);
                    }
                    if (scissors) {
                        frames.add(LeapClient.Move.SCISSORS);
                    }
                }
            }
        }

        return findMode(frames);
    }

    private static LeapClient.Move findMode(List<LeapClient.Move> frames) {
        HashMap<LeapClient.Move, Integer> moveMap = new HashMap<>();
        for (LeapClient.Move move: frames) {
            Integer count = moveMap.get(move);
            if (count == null) {
                count = 0;
            }
            count++;
            moveMap.put(move, count);
        }
        LeapClient.Move mode = null;
        for (LeapClient.Move move: moveMap.keySet()) {
            if (mode == null) {
                mode = move;
            }
            else if (moveMap.get(mode) < moveMap.get(move)){
                mode = move;
            }
        }

        System.out.println(moveMap.keySet().size());
        for (LeapClient.Move move: moveMap.keySet()) {
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
