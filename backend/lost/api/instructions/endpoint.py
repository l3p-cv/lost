from flask import request
from flask_restx import Resource
from lost.api.api import api
from lost.db import model, access
from lost.settings import LOST_CONFIG

namespace = api.namespace('instructions', description='API for managing instructions')

# GET: Fetch 
@namespace.route('/getInstructions')
class GetInstructions(Resource):
    def get(self):
        try:
            dbm = access.DBMan(LOST_CONFIG)
            
            print("Fetching instructions...")
            
            instructions = dbm.session.query(model.Instruction).filter(model.Instruction.is_deleted == False).all()

            print(f"Fetched {len(instructions)} instructions.")
            
            return {'instructions': [instruction.to_dict() for instruction in instructions]}, 200
        except Exception as e:
            print(f"Error: {str(e)}")
            return {'message': f'Error fetching instructions: {str(e)}'}, 500


# POST: Add 
@namespace.route('/addInstruction')
class AddInstruction(Resource):
    def post(self):
        new_instruction = request.get_json()

        if not new_instruction.get('option') or not new_instruction.get('instruction'):
            return {'message': 'Missing required fields (option, instruction)'}, 400

        try:
            dbm = access.DBMan(LOST_CONFIG)

            instruction = model.Instruction(
                option=new_instruction['option'],
                description=new_instruction.get('description', ''),
                instruction=new_instruction['instruction'],
                is_deleted=False,  # By default, the instruction is not deleted
                group_id=new_instruction.get('group_id', None)  # Assuming 'group_id' is provided
            )

            dbm.session.add(instruction)
            dbm.session.commit()

            return {'message': 'Instruction added successfully', 'instruction': instruction.to_dict()}, 201
        except Exception as e:
            dbm.session.rollback()
            return {'message': f'Error adding instruction: {str(e)}'}, 500


# PUT: Edit
@namespace.route('/editInstruction')
class EditInstruction(Resource):
    def put(self):
        updated_instruction = request.get_json()
        instruction_id = updated_instruction.get('id')

        if not instruction_id:
            return {'message': 'Instruction ID is required'}, 400

        try:
            dbm = access.DBMan(LOST_CONFIG)

            instruction = dbm.session.query(model.Instruction).filter_by(id=instruction_id).first()

            if not instruction or instruction.is_deleted:
                return {'message': 'Instruction not found or is deleted'}, 404

            instruction.option = updated_instruction.get('option', instruction.option)
            instruction.description = updated_instruction.get('description', instruction.description)
            instruction.instruction = updated_instruction.get('instruction', instruction.instruction)
            instruction.is_deleted = updated_instruction.get('is_deleted', instruction.is_deleted)

            dbm.session.commit()

            return {'message': 'Instruction updated successfully', 'instruction': instruction.to_dict()}, 200
        except Exception as e:
            dbm.session.rollback()  # In case of error, rollback transaction
            return {'message': f'Error updating instruction: {str(e)}'}, 500


# DELETE:
@namespace.route('/deleteInstruction/<int:id>')
class DeleteInstruction(Resource):
    def delete(self, id):
        try:
            dbm = access.DBMan(LOST_CONFIG)

            instruction = dbm.session.query(model.Instruction).filter_by(id=id).first()

            if not instruction or instruction.is_deleted:
                return {'message': 'Instruction not found or is already deleted'}, 404

            # Soft delete
            instruction.is_deleted = True
            dbm.session.commit()

            return {'message': 'Instruction deleted successfully'}, 200
        except Exception as e:
            dbm.session.rollback() 
            return {'message': f'Error deleting instruction: {str(e)}'}, 500