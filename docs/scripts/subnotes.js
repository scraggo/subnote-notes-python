/*Created on 7/25/17

@author: scraggo (github.com/scraggo)

Title: Subnotes - a plain text notes and tasks system
    see example below for the expected in format
    - spaces between each link determine 'blocks'
    - headers are the first line of a block or a single line.
*/

class Subnotes {
    /*
    Subnotes takes your notes and subnotes in a simple format:
    a header line with lines (subnotes) right below and at least one line break in between
    
    - organizes the headers alphabetically.
    - puts all the 'done' items at the bottom with a time stamp.
    - tag filter allows user to display their choice of tags within their text.
    */

    //CLASS VARIABLES
    TAG_REGEX = re.compile(r'\B@\S+');
    LOWEST_CHAR = '~' * 10;
    // LOWEST_CHAR = chr(1114111) * 2

    constructor(input_text, spacing=4) {
        this.input_list = input_text.split('\n')
        this.block_list = this.make_blocks(this.input_list)
        this.encoded_list = []
        this._spacing = spacing
        this.set_spacing(this._spacing)
        this.block_encoder()
    }

    set_spacing(this, new_spacing=4):
        valid_spacing = [2,4,5]
        str_valid = ', '.join(str(x) for x in valid_spacing)
        if new_spacing in valid_spacing:
            this._spacing = new_spacing
        else:
            // raise ValueError('Spacing must be {} spaces.'.format(''.join(str_valid)))
            print('ERROR: Spacing must be {} spaces.\nQuitting.'.format(''.join(str_valid)))
            sys.exit()
        return this._spacing

    block_encoder(this):
        /*
        Main function that appends dict objects to this.encoded_list as such:
        [
        {'project': '+projectB', 'done': ['    x note1B'], 'Subnote': ['    note2B']}, {'note': 'note all alone'},
        {'note': 'note with subnotes', 'Subnote': ['    note subnote1 @!', '    note subnote2']},
        {'project': '+projectA @!', 'Subnote': ['    note1A', '    note2A']}
        ]
    
        Properties used:
            block_list, encoded_list, spacing
        Returns:
            Sorted encodedf_list by 'header' (using sorted_blocks)
        */

        for i, block in enumerate(this.block_list):
            // set default dictionary
            // headers are encoded as LOWEST_CHAR if first and only line is preceded by 'x'
            this.encoded_list.append({
                'header': this.LOWEST_CHAR,
                'data': [],
                'tags': [],
                'done': []
            })

            for line in block:
                line = this.fix_spacing(line)
                // done items start with x
                if line.strip().startswith('x '):
                    this.encoded_list[i]['done'].append(line)
    
                else:
                    if line == block[0]: // line is the 'header'
                        this.encoded_list[i]['header'] = line.strip()
                    else: // line is 'data'
                        this.encoded_list[i]['data'].append(line)
    
                    tagList = this.TAG_REGEX.findall(line)
                    if tagList:
                        for tag in tagList:
                            this.encoded_list[i]['tags'].append(tag)

            if this.encoded_list[i]['header'] == this.LOWEST_CHAR and\
                    len(this.encoded_list[i]['data']) > 0:
                this.encoded_list[i]['header'] = '{Completed Project}'

        this.encoded_list = this.sort_blocks(this.encoded_list)

    fix_spacing(this, f_text):
        /*
        1. Replaces tabs with class-defined spacing
        2. Counts the leading spaces for an input string.
        3. If spacing is inconsistent with spacing, two levels of indent are imposed.
    
        Args:
            f_text: a string of text
        Returns:
            a string with above operations
        Raises:
            sys.exit() if spacing is inconsistent
        */

        // if spaces % SPACING != 0:
        //     print('WARNING - INCONSISTENT SPACING!\n>>>' + f_text)
        //     print("has {} spaces. Convert to multiples of {} spaces.".format(spaces, SPACING))
        //     sys.exit()

        // convert tabs to spaces
        line = f_text.replace('\t', ' ' * this._spacing)
        // get number of leading spaces
        spaces = len(f_text) - len(f_text.lstrip())
        if spaces % 4 != 0:
            if spaces < 4:
                line = ' '*4 + line.strip()
            else:
                line = ' '*8 + line.strip()

        return line

    // @staticmethod
    make_blocks(f_list):
        /*
        Args:
            f_list: this is the user's text, list format, split by new line
        Returns:
            A list of lists where each list is determined by empty lines
        */

        return [list(g[1]) for g in itertools.groupby(f_list, key=lambda x: x.strip() != '') if g[0]]

    // @staticmethod
    sort_blocks(f_list):
        /*
        Sorts f_list by key ['header']
        */

        return sorted(f_list, key=lambda k: k['header'].lower())
    
    return_all_tags(this):
        /*
        returns all the tags as a list, sorted in abc order with no duplicates
        */

        unsortedtags = []
        for item in this.encoded_list:
            tagslist = item['tags']
            if tagslist != []:
                for tag in tagslist:
                    if tag not in unsortedtags:
                        unsortedtags.append(tag)
    
        return sorted(unsortedtags)

    return_all_sorted(this):
        /*returns all items sorted as a string for printing or clipboard.*/
    
        allSorted = []
        doneList = []
    
        for item in this.encoded_list:
            header_exists = True
    
            if item['header'] not in ['', this.LOWEST_CHAR]:
                allSorted.append('\n' + item['header'].rstrip())
            else:
                header_exists = False
    
            if len(item['data']) > 0:
                if not header_exists:
                    allSorted.append('')
                for data_item in item['data']:
                    allSorted.append(data_item.rstrip())
    
            if len(item['done']) > 0:
                //append to separate list
                doneList.append(item)
                
        //put done items at end of list with timestamp
    
        //prints the current date and time
        allSorted.append('\n' + str(datetime.now()))
    
        // append done items to list
        for data in doneList:
            // if type(data['done']) == list:
            if data['header'] == this.LOWEST_CHAR or\
                    data['header'] == '{Completed Project}' or\
                    len(data['header']) < 1:
                // print('header empty')//debug
                for doneItem in data['done']:
                    allSorted.append(doneItem.strip())
            else:
                allSorted.append(data['header'])
                for doneItem in data['done']:
                    // print('header not empty')//debug
                    allSorted.append(' ' * this._spacing + doneItem.strip())
                    
        return '\n'.join(allSorted)
    
    
    tag_filter(this):
        /*
        Prints projects that contain f_tag input by user.
        Done items with tags are not included.
    
        Args:
            encodedf_list: the encoded list
        Returns:
            None (only prints)
        */

        all_tags = this.return_all_tags()
        if len(all_tags) < 1:
            print('No tags found.\n')
        else:
            print('Your Tags: ', end='')
            print(', '.join(all_tags))
            print()
            //get user input
            f_tag = input('Tag to search (include @): ')
            //filter by f_tag
            filtered_tags = []
            for encoded_item in this.encoded_list:
                for k, v in encoded_item.items():
                    if k == 'tags':
                        for str_tag in v:
                            if str_tag.find(f_tag) > -1:
                                filtered_tags.append(encoded_item['header'])
                                break

            if len(filtered_tags) > 0:
                print()
                print('*' * (20 + len(f_tag)))
                print('Projects with tag: {}'.format(f_tag))
                print('*' * (20 + len(f_tag)))
                for header_tag in filtered_tags:
                    print(header_tag)
                print()
            else:
                print('No notes with {} tag found.\n'.format(f_tag))

                    
}

// === end Subnotes class===
// === start global functions ===

function menu():
    /*
    Prints a menu, gets user choice input, returns input (string).
    */

    print('Choose from the following options:')
    print('''    1. Order your notes alphabetically.
    2. Display priority tag (@!) notes.
    q. Quit''')
    f_choice = input('> ')
    return f_choice
    

function main():
    os.system('cls' if os.name == 'nt' else 'clear')

    while True:
        print('Welcome to Subnotes! ', end='')
        choice = menu()
        if choice not in ['1', '2', '']:
            print('Thanks and goodbye!')
            break

        print('Copy your notes to clipboard, enter when done:')
        user_pause = input('> ')
        // todoTxt = pyperclip.paste()
        // todoArray = todoTxt.split('\n')
        // encodedTodos = []
        // encodedTodos = blockEncoder(todoArray, encodedTodos)

        my_todos = Subnotes(pyperclip.paste())

        if choice in ['1', '']: //default if user presses enter
            my_sorted = ''.join(my_todos.return_all_sorted())
            // pprint(my_sorted)//debug
            pyperclip.copy(my_sorted)
            print('\nYour sorted notes were copied to your clipboard.\n')

        elif choice == '2':
            my_todos.tag_filter()



main()