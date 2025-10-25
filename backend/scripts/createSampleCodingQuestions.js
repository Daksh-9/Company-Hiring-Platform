require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dbuser:Vivek123@cluster0.sx83e.mongodb.net/hiring_platform';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');
    createSampleQuestions();
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Coding Question Schema
const codingQuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy'
    },
    timeLimit: {
        type: Number,
        default: 30
    },
    memoryLimit: {
        type: Number,
        default: 256000
    },
    testCases: [{
        input: {
            type: String,
            required: true
        },
        expectedOutput: {
            type: String,
            required: true
        },
        isHidden: {
            type: Boolean,
            default: false
        }
    }],
    starterCode: {
        python: String,
        c: String,
        cpp: String,
        java: String,
        javascript: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CodingQuestion = mongoose.model('CodingQuestion', codingQuestionSchema);

async function createSampleQuestions() {
    try {
        // Clear existing questions
        await CodingQuestion.deleteMany({});
        console.log('🗑️ Cleared existing coding questions');

        const sampleQuestions = [
            {
                title: "Reverse a String",
                description: "Write a function that takes a string as input and returns the string reversed. The function should handle both single words and sentences.",
                difficulty: "Easy",
                timeLimit: 30,
                memoryLimit: 256000,
                testCases: [
                    { input: "hello", expectedOutput: "olleh", isHidden: false },
                    { input: "world", expectedOutput: "dlrow", isHidden: false },
                    { input: "12345", expectedOutput: "54321", isHidden: false },
                    { input: "Hello World", expectedOutput: "dlroW olleH", isHidden: true }
                ],
                starterCode: {
                    python: `def reverse_string(s):
    # Your code here
    pass`,
                    c: `#include <stdio.h>
#include <string.h>

char* reverseString(char* str) {
    // Your code here
    return str;
}

int main() {
    char str[100];
    printf("Enter a string: ");
    scanf("%s", str);
    printf("Reversed: %s\\n", reverseString(str));
    return 0;
}`,
                    cpp: `#include <iostream>
#include <string>
using namespace std;

string reverseString(string str) {
    // Your code here
    return str;
}

int main() {
    string str;
    cout << "Enter a string: ";
    cin >> str;
    cout << "Reversed: " << reverseString(str) << endl;
    return 0;
}`,
                    java: `public class Solution {
    public String reverseString(String str) {
        // Your code here
        return "";
    }
}`,
                    javascript: `function reverseString(str) {
  // Your code here
  
}`
                }
            },
            {
                title: "Find Maximum Number",
                description: "Write a function that finds the maximum number in an array of integers. The array will contain at least one element.",
                difficulty: "Easy",
                timeLimit: 30,
                memoryLimit: 256000,
                testCases: [
                    { input: "3 7 2 9 1", expectedOutput: "9", isHidden: false },
                    { input: "-1 -5 -3", expectedOutput: "-1", isHidden: false },
                    { input: "0 0 0", expectedOutput: "0", isHidden: false },
                    { input: "100 200 150 300", expectedOutput: "300", isHidden: true }
                ],
                starterCode: {
                    python: `def find_max(arr):
    # Your code here
    pass`,
                    c: `#include <stdio.h>

int findMax(int arr[], int n) {
    // Your code here
    return 0;
}

int main() {
    int arr[] = {3, 7, 2, 9, 1};
    int n = sizeof(arr) / sizeof(arr[0]);
    printf("Maximum: %d\\n", findMax(arr, n));
    return 0;
}`,
                    cpp: `#include <iostream>
#include <vector>
using namespace std;

int findMax(vector<int>& arr) {
    // Your code here
    return 0;
}

int main() {
    vector<int> arr = {3, 7, 2, 9, 1};
    cout << "Maximum: " << findMax(arr) << endl;
    return 0;
}`,
                    java: `public class Solution {
    public int findMax(int[] arr) {
        // Your code here
        return 0;
    }
}`,
                    javascript: `function findMax(arr) {
  // Your code here
  
}`
                }
            },
            {
                title: "Check Palindrome",
                description: "Write a function that checks if a string is a palindrome (reads the same forwards and backwards). Ignore case and non-alphanumeric characters.",
                difficulty: "Medium",
                timeLimit: 45,
                memoryLimit: 256000,
                testCases: [
                    { input: "racecar", expectedOutput: "true", isHidden: false },
                    { input: "hello", expectedOutput: "false", isHidden: false },
                    { input: "anna", expectedOutput: "true", isHidden: false },
                    { input: "A man a plan a canal Panama", expectedOutput: "true", isHidden: true }
                ],
                starterCode: {
                    python: `def is_palindrome(s):
    # Your code here
    pass`,
                    c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <ctype.h>

bool isPalindrome(char* str) {
    // Your code here
    return false;
}

int main() {
    char str[100];
    printf("Enter a string: ");
    scanf("%s", str);
    printf("%s\\n", isPalindrome(str) ? "true" : "false");
    return 0;
}`,
                    cpp: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

bool isPalindrome(string str) {
    // Your code here
    return false;
}

int main() {
    string str;
    cout << "Enter a string: ";
    cin >> str;
    cout << (isPalindrome(str) ? "true" : "false") << endl;
    return 0;
}`,
                    java: `public class Solution {
    public boolean isPalindrome(String str) {
        // Your code here
        return false;
    }
}`,
                    javascript: `function isPalindrome(str) {
  // Your code here
  
}`
                }
            }
        ];

        // Insert sample questions
        for (const question of sampleQuestions) {
            const newQuestion = new CodingQuestion(question);
            await newQuestion.save();
            console.log(`✅ Created question: ${question.title}`);
        }

        console.log(`🎉 Successfully created ${sampleQuestions.length} sample coding questions!`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating sample questions:', error);
        process.exit(1);
    }
}

