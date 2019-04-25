import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class KeyboardController implements GameController {
    @Override
    public LeapClient.Move getMove() {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        System.out.println("Whats yo move bitch");
        try {
            String input = br.readLine();
            switch (input) {
                case "r":
                    return LeapClient.Move.ROCK;
                case "p":
                    return LeapClient.Move.PAPER;
                case "s":
                    return LeapClient.Move.SCISSORS;
                default:
                    return LeapClient.Move.ROCK;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return LeapClient.Move.ROCK;
    }
}
