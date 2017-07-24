# import re
# import pprint
import os, sys
import pyperclip
from datetime import datetime

def spaceChecker(text):
    '''We want a file that has mod 4 spaces and no tabs'''

    if '\t' in text:
        print('ERROR>>>' + text)
        sys.exit("Tabs detected. Convert to 4 spaces")

    #count how many leading spaces
    spaces = (len(text) - len(text.lstrip()))

    if spaces % 4 != 0:
        print('ERROR>>>' + text)
        sys.exit("Uneven spacing detected. Convert to 4 spaces")

    return spaces

def todoEncoder(array, encodedList):

    for line in array:
        spaces = spaceChecker(line)
        #ignore empty lines
        if len(line.strip()) == 0:
            continue

        # if no spaces, encode as top level
        elif spaces == 0:
            #collect 'project' items
            if line[0] == '+':
                encodedList.append({'project': line})
            #collect 'done' items
            elif line.startswith('x '):
                encodedList.append({'done': line})
            #collect untitled notes as 'note'
            else:
                encodedList.append({'note': line})
                
        #if spaces, then append to top level project
        elif spaces > 0:
            if len(encodedList) > 0:
                lastProjectIndex = len(encodedList) - 1
            else:
                print('ERROR>>>'+line)
                sys.exit('First line must not be indented.')

            if line.strip().startswith('x '):
                subDone = encodedList[lastProjectIndex]
                subDone.setdefault('done', [])
                subDone['done'].append(line) #or line.strip() ?
            else:
                subNote = encodedList[lastProjectIndex]
                subNote.setdefault('Subnote', [])
                # print(subNote['note']) #debug
                # print('lastProjectIndex', lastProjectIndex) #debug
                subNote['Subnote'].append(line) #or line.strip() ?
                # print('subNote:',subNote['note']) #debug


def printTodo(todoItem):
    '''todoItem is a single dict object from encoded todos'''
    if 'project' in todoItem:
        print(todoItem['project'])
    elif 'note' in todoItem:
        print(todoItem['note'])
    # else:
    #     print('>>>error')

    if 'Subnote' in todoItem:
        for subNote in todoItem['Subnote']:
            print(subNote)

    if 'done' in todoItem:
        if type(todoItem['done']) == str:
            print(todoItem['done'])
        else:
            for doneItem in todoItem['done']:
                print(doneItem)

def printProjects(encodedList):
    # print('\nPROJECTS:\n')
    # filter by projects
    projectList = []
    for data in encodedList:
        if 'project' in data:
            projectList.append(data)

    # sort by project name
    projectList2 = sorted(projectList, key=lambda k: k['project'].lower())

    # display projects
    for project in projectList2:
        print(project['project'])
        if 'Subnote' in project:
            for note in project['Subnote']:
                print(note) #with 4 preceding spaces?

def printNotes(encodedList):
    # print('\nNOTES:\n')
    # filter by notes
    noteList = []
    for data in encodedList:
        if 'project' not in data and 'note' in data: #and 'done' not in data (removed)
            noteList.append(data)

    # sort by note name
    noteList2 = sorted(noteList, key=lambda k: k['note'].lower())

    # display notes
    for note in noteList2:
        print(note['note'])
        if 'Subnote' in note:
            for note in note['Subnote']:
                print(note) #with 4 preceding spaces?
        print()

def printDone(encodedList):
    # print('DONE:')

    #prints the current date and time
    print(str(datetime.now()))

    # filter by done
    doneList = []
    for fullData in encodedList:
        if 'done' in fullData:
            doneList.append(fullData)    

    # display notes
    for data in doneList:
        if type(data['done']) == list:
            for doneItem in data['done']:
                if 'project' in data:
                    print(doneItem.strip() + ', ' + data['project'])
                elif 'note' in data:
                    print(doneItem.strip() + ', (' + data['note'][:14] + '...)')
                else:
                    print(doneItem.strip())

        else: #items are strings
            if 'project' in data:
                print(data['done'].strip() + ', ' + data['project'])
            elif 'note' in data:
                print(data['done'].strip() + ', (' + data['note'][:14] + '...)')
            else:
                print(data['done'])


def sortAll(encodedList):
    printProjects(encodedList)
    print()
    printNotes(encodedList)
    printDone(encodedList)


def priorityTagFilter():
    #Beware of global encodedTodos!
    #filter by @!
    print(r'PRIORITY ITEMS - with @! tag')
    print('*'*28)
    for todoItem in encodedTodos:
        for v in todoItem.values():
            if type(v) == str and '@!' in v:
                printTodo(todoItem)
                print()
                break #inner loop only?
            elif type(v) == list:
                for subItem in v:
                    if '@!' in subItem:
                        printTodo(todoItem)
                        print()
                        break

def menu():
    print('Choose from the following options:')
    print('''    1. Order your notes alphabetically.
    2. Display priority tag (@!) notes.
    q. Quit''')
    choice = input('> ')
    return choice

def debugPrintAll():
    #test - rename without '2' at end
    todoTxt2 = '''
+projectB
    x note1B
    note2B
    
note all alone

note with subnotes
    note subnote1 @!
    note subnote2

+projectA @!
    note1A
    note2A
'''
    todoArray = todoTxt2.split('\n')
    encodedTodos2 = []
    todoEncoder(todoArray, encodedTodos2)
    #debug encoded todos
    print(encodedTodos2)
    #prints all
    for todoItem in encodedTodos2:
        printTodo(todoItem) #see function, rename var
        print()

# debugPrintAll()
# pause = input('>')

while True:
    os.system('cls' if os.name == 'nt' else 'clear')
    print('Welcome to Subnotes! ', end='')
    choice = menu()
    if choice not in ['1', '2']:
        print('Thanks and goodbye!')
        break

    print('Copy your notes to clipboard, enter when done:')
    pause = input('> ')
    todoTxt = pyperclip.paste()
    todoArray = todoTxt.split('\n')
    encodedTodos = []

    todoEncoder(todoArray, encodedTodos)

    if choice == '1':
        sortAll(encodedTodos)

    elif choice == '2':
        priorityTagFilter()

    print('\n\nCool! But, what now?')
    print(
    'You may select and this output to your clipboard to put into your personal file system.\n\
To return to main menu, hit enter.\n\
If you\'ve got everything you need, hit q to quit.')
    pause = input('> ')
    if pause.lower() == 'q':
        print('Thanks and goodbye!')
        break